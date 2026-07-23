/**
 * ProcessZip Lambda
 *
 * Triggered by: S3 ObjectCreated on staging/<slug>.zip in the magazines bucket → SQS → this Lambda
 *
 * Flow:
 *   1. Extract slug from the S3 key (staging/<slug>.zip)
 *   2. Download the zip from S3 into memory
 *   3. Unzip all entries using fflate
 *   4. Strip the common top-level folder prefix from paths (if present)
 *   5. Detect thumbnail: exactly one root-level image file must be present
 *   6. Generate index.html when a PDF issue has no root index
 *   7. Delete the existing <slug>/ prefix and upload the replacement files
 *   8. Update the MAGAZINE DDB record: status='unpublished', thumbnail_key
 *   9. Delete the staging zip
 *   10. Invalidate the magazine CloudFront cache for this slug
 *
 * Memory note: magazine zips are expected to be < 200MB. Lambda is configured
 * with 1024MB so in-memory unzip is safe for typical issues.
 */

import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Readable } from "stream";
import { unzipSync } from "fflate";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { isValidMagazineSlug } from "@icaf/shared";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const cloudfront = new CloudFrontClient({ region: process.env.AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

const MAGAZINES_BUCKET = process.env.MAGAZINES_BUCKET_NAME!;
const MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID = process.env.MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID;
const TABLE_NAME = process.env.TABLE_NAME!;

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp", "tiff", "svg"]);
const MAX_ZIP_FILE_COUNT = 5_000;
const MAX_UNCOMPRESSED_BYTES = 500 * 1024 * 1024;
const MAX_ZIP_ENTRY_PATH_LEN = 1024;

const MIME_MAP: Record<string, string> = {
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    bmp: "image/bmp",
    tiff: "image/tiff",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    otf: "font/otf",
    pdf: "application/pdf",
    xml: "application/xml",
    txt: "text/plain",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
};

type UploadEntry = {
    path: string;
    data: Uint8Array;
};

type ZipFileEntry = {
    originalPath: string;
    path: string;
    data: Uint8Array;
};

function getContentType(filename: string): string {
    const ext = getExtension(filename);
    return MIME_MAP[ext] ?? "application/octet-stream";
}

function getExtension(filename: string): string {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function isImageFile(filename: string): boolean {
    return IMAGE_EXTENSIONS.has(getExtension(filename));
}

function isPdfFile(filename: string): boolean {
    return getExtension(filename) === "pdf";
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function generatePdfIndex(slug: string, pdfPath: string): string {
    const href = encodeURI(pdfPath);
    const title = escapeHtml(slug);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
    html, body { margin: 0; min-height: 100%; font-family: Arial, sans-serif; background: #f7f7f7; color: #171717; }
    main { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 18px; background: #ffffff; border-bottom: 1px solid #dedede; }
    h1 { margin: 0; font-size: 18px; line-height: 1.3; }
    a { color: #134380; font-weight: 700; }
    iframe { width: 100%; height: 100%; min-height: calc(100vh - 58px); border: 0; background: #ffffff; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${title}</h1>
      <a href="${href}">Open PDF</a>
    </header>
    <iframe src="${href}" title="${title} PDF"></iframe>
  </main>
</body>
</html>
`;
}

function validateZipEntryPath(path: string): string | null {
    if (!path) return "path is empty";
    if (path.length > MAX_ZIP_ENTRY_PATH_LEN) return "path is too long";
    if (path.includes("\0")) return "path contains a null byte";
    if (path.startsWith("/")) return "absolute paths are not allowed";

    const segments = path.split("/");
    if (segments.some((segment) => segment === "")) {
        return "empty path segments are not allowed";
    }
    if (segments.some((segment) => segment === "." || segment === "..")) {
        return "relative path segments are not allowed";
    }

    return null;
}

function normalizeZipEntryPath(path: string): string {
    return path.replaceAll("\\", "/");
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

async function deleteObjectsWithPrefix(bucket: string, prefix: string): Promise<void> {
    let continuationToken: string | undefined;

    do {
        const listResp = await s3.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            }),
        );

        const objects = (listResp.Contents ?? [])
            .map((obj) => obj.Key)
            .filter((key): key is string => Boolean(key));

        for (let index = 0; index < objects.length; index += 1000) {
            const batch = objects.slice(index, index + 1000);
            await s3.send(
                new DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: {
                        Objects: batch.map((Key) => ({ Key })),
                        Quiet: true,
                    },
                }),
            );
        }

        continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
    } while (continuationToken);
}

async function invalidateMagazineCache(slug: string): Promise<void> {
    if (!MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID) return;

    await cloudfront.send(
        new CreateInvalidationCommand({
            DistributionId: MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: `${slug}-${Date.now()}`,
                Paths: {
                    Quantity: 2,
                    Items: [`/${slug}`, `/${slug}/*`],
                },
            },
        }),
    );
}

/**
 * Strip the common top-level folder prefix from zip entry paths, if every
 * file shares one. Zip tools often wrap everything in a folder named after
 * the source directory (e.g. ArtAndHealth/index.html → index.html).
 */
function stripCommonPrefix(paths: string[]): Map<string, string> {
    const result = new Map<string, string>();
    if (paths.length === 0) return result;

    const firstSlash = paths[0].indexOf("/");
    if (firstSlash > 0) {
        const prefix = paths[0].slice(0, firstSlash + 1);
        if (paths.every((p) => p.startsWith(prefix))) {
            for (const p of paths) result.set(p, p.slice(prefix.length));
            return result;
        }
    }

    // No common prefix — use paths as-is
    for (const p of paths) result.set(p, p);
    return result;
}

async function processRecord(record: SQSRecord): Promise<void> {
    const s3Event = JSON.parse(record.body);
    const s3Record = s3Event.Records?.[0];
    if (!s3Record) {
        console.warn("No S3 record in SQS message — skipping.");
        return;
    }

    const bucket = s3Record.s3.bucket.name as string;
    const srcKey = decodeURIComponent((s3Record.s3.object.key as string).replace(/\+/g, " "));

    // Key must be staging/<slug>.zip
    const match = srcKey.match(/^staging\/(.+)\.zip$/);
    if (!match) {
        console.warn(`Unexpected key "${srcKey}" — expected staging/<slug>.zip. Skipping.`);
        return;
    }
    const slug = match[1];
    if (!isValidMagazineSlug(slug)) {
        console.warn(`Unexpected key "${srcKey}" — invalid magazine slug. Skipping.`);
        return;
    }

    console.log(`Processing magazine zip: slug=${slug}, bucket=${bucket}`);

    // ── 1. Download zip ────────────────────────────────────────────────────
    const getResp = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: srcKey }),
    );
    const zipBuffer = await streamToBuffer(getResp.Body as Readable);

    // ── 2. Unzip ───────────────────────────────────────────────────────────
    const decompressed = unzipSync(new Uint8Array(zipBuffer));

    // Filter out directory entries (trailing slash, zero bytes), and normalize
    // Windows-created zip paths before validation and upload.
    const fileEntries: ZipFileEntry[] = Object.entries(decompressed)
        .map(([originalPath, data]) => ({
            originalPath,
            path: normalizeZipEntryPath(originalPath),
            data,
        }))
        .filter((entry) => !entry.path.endsWith("/") && entry.data.length > 0);

    if (fileEntries.length === 0) {
        throw new Error(`Zip for slug "${slug}" contained no files after extraction.`);
    }
    if (fileEntries.length > MAX_ZIP_FILE_COUNT) {
        throw new Error(
            `Zip for slug "${slug}" contains ${fileEntries.length} files; maximum is ${MAX_ZIP_FILE_COUNT}.`,
        );
    }

    let uncompressedBytes = 0;
    const normalizedPaths = new Set<string>();
    for (const { originalPath, path, data } of fileEntries) {
        const pathError = validateZipEntryPath(path);
        if (pathError) {
            throw new Error(`Unsafe zip entry path "${originalPath}": ${pathError}.`);
        }
        if (normalizedPaths.has(path)) {
            throw new Error(`Zip contains duplicate normalized path "${path}".`);
        }
        normalizedPaths.add(path);
        uncompressedBytes += data.length;
    }
    if (uncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
        throw new Error(
            `Zip for slug "${slug}" is too large after extraction; maximum is ${MAX_UNCOMPRESSED_BYTES} bytes.`,
        );
    }

    // Strip common top-level prefix
    const pathMap = stripCommonPrefix(fileEntries.map((entry) => entry.path));
    const strippedPaths = new Set<string>();
    for (const strippedPath of pathMap.values()) {
        const pathError = validateZipEntryPath(strippedPath);
        if (pathError) {
            throw new Error(`Unsafe stripped zip entry path "${strippedPath}": ${pathError}.`);
        }
        if (strippedPaths.has(strippedPath)) {
            throw new Error(`Zip contains duplicate stripped path "${strippedPath}".`);
        }
        strippedPaths.add(strippedPath);
    }

    // ── 3. Find thumbnail (exactly one root-level image file) ─────────────
    const rootImagePaths: string[] = [];
    for (const { path } of fileEntries) {
        const strippedPath = pathMap.get(path)!;
        // Root-level = no slash in the stripped path
        if (!strippedPath.includes("/") && isImageFile(strippedPath)) {
            rootImagePaths.push(strippedPath);
        }
    }

    if (rootImagePaths.length === 0) {
        throw new Error(
            `Zip for slug "${slug}" contains no root-level image file. ` +
            `Include a cover image (jpg, png, webp, etc.) at the top level of the zip.`,
        );
    }
    if (rootImagePaths.length > 1) {
        throw new Error(
            `Zip for slug "${slug}" contains more than one root-level image file: ` +
            `${rootImagePaths.join(", ")}. Keep exactly one cover image at the top level of the zip.`,
        );
    }

    const thumbnailKey = rootImagePaths[0];

    // ── 4. Generate a minimal index.html for PDF-only issues ───────────────
    const uploadEntries: UploadEntry[] = fileEntries.map(({ path, data }) => ({
        path: pathMap.get(path)!,
        data,
    }));

    const hasRootIndex = uploadEntries.some((entry) => entry.path.toLowerCase() === "index.html");
    if (!hasRootIndex) {
        const firstPdf = uploadEntries.find((entry) => isPdfFile(entry.path));
        if (!firstPdf) {
            throw new Error(
                `Zip for slug "${slug}" contains no index.html and no PDF to wrap. ` +
                `Include an index.html file or a PDF file.`,
            );
        }

        uploadEntries.push({
            path: "index.html",
            data: Buffer.from(generatePdfIndex(slug, firstPdf.path)),
        });
        console.log(`Generated index.html wrapper for PDF issue: slug=${slug}, pdf=${firstPdf.path}`);
    }

    // ── 5. Replace existing issue files, then upload under <slug>/ ─────────
    await deleteObjectsWithPrefix(MAGAZINES_BUCKET, `${slug}/`);

    const uploads = uploadEntries.map(async ({ path, data }) => {
        const destKey = `${slug}/${path}`;
        const contentType = getContentType(path);

        await s3.send(
            new PutObjectCommand({
                Bucket: MAGAZINES_BUCKET,
                Key: destKey,
                Body: Buffer.from(data),
                ContentType: contentType,
            }),
        );
        console.log(`Uploaded: ${destKey}`);
    });

    await Promise.all(uploads);

    // ── 6. Update DDB record ───────────────────────────────────────────────
    await dynamodb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: "MAGAZINE", SK: slug },
            UpdateExpression: "SET #status = :status, thumbnail_key = :thumb",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "unpublished",
                ":thumb": thumbnailKey,
            },
        }),
    );

    // ── 7. Delete staging zip ──────────────────────────────────────────────
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcKey }));
    await invalidateMagazineCache(slug);

    console.log(
        `Magazine "${slug}" processed successfully. ` +
        `Files: ${uploadEntries.length}, Thumbnail: ${thumbnailKey}`,
    );
}

export const handler = async (event: SQSEvent): Promise<{ batchItemFailures: { itemIdentifier: string }[] }> => {
    const failures: { itemIdentifier: string }[] = [];

    for (const record of event.Records) {
        try {
            await processRecord(record);
        } catch (error) {
            console.error(`Failed to process record ${record.messageId}:`, error);
            failures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures: failures };
};
