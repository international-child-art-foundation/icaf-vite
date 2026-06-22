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
 *   5. Upload each file to <slug>/<path> in the magazines bucket
 *   6. Detect thumbnail: the first root-level image file found
 *   7. Update the MAGAZINE DDB record: status='published', thumbnail_key, published_at
 *   8. Delete the staging zip
 *
 * Memory note: magazine zips are expected to be < 200MB. Lambda is configured
 * with 1024MB so in-memory unzip is safe for typical issues.
 */

import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Readable } from "stream";
import { unzipSync } from "fflate";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { isValidMagazineSlug } from "@icaf/shared";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

const MAGAZINES_BUCKET = process.env.MAGAZINES_BUCKET_NAME!;
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

function validateZipEntryPath(path: string): string | null {
    if (!path) return "path is empty";
    if (path.length > MAX_ZIP_ENTRY_PATH_LEN) return "path is too long";
    if (path.includes("\0")) return "path contains a null byte";
    if (path.includes("\\")) return "backslash paths are not allowed";
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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
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

    // Filter out directory entries (trailing slash, zero bytes)
    const fileEntries = Object.entries(decompressed).filter(
        ([path, data]) => !path.endsWith("/") && data.length > 0,
    );

    if (fileEntries.length === 0) {
        throw new Error(`Zip for slug "${slug}" contained no files after extraction.`);
    }
    if (fileEntries.length > MAX_ZIP_FILE_COUNT) {
        throw new Error(
            `Zip for slug "${slug}" contains ${fileEntries.length} files; maximum is ${MAX_ZIP_FILE_COUNT}.`,
        );
    }

    let uncompressedBytes = 0;
    for (const [path, data] of fileEntries) {
        const pathError = validateZipEntryPath(path);
        if (pathError) {
            throw new Error(`Unsafe zip entry path "${path}": ${pathError}.`);
        }
        uncompressedBytes += data.length;
    }
    if (uncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
        throw new Error(
            `Zip for slug "${slug}" is too large after extraction; maximum is ${MAX_UNCOMPRESSED_BYTES} bytes.`,
        );
    }

    // Strip common top-level prefix
    const pathMap = stripCommonPrefix(fileEntries.map(([p]) => p));
    for (const strippedPath of pathMap.values()) {
        const pathError = validateZipEntryPath(strippedPath);
        if (pathError) {
            throw new Error(`Unsafe stripped zip entry path "${strippedPath}": ${pathError}.`);
        }
    }

    // ── 3. Find thumbnail (first root-level image file) ───────────────────
    let thumbnailKey: string | undefined;
    for (const [originalPath] of fileEntries) {
        const strippedPath = pathMap.get(originalPath)!;
        // Root-level = no slash in the stripped path
        if (!strippedPath.includes("/") && isImageFile(strippedPath)) {
            thumbnailKey = strippedPath;
            break;
        }
    }

    // thumbnail_key is required — every magazine zip must include a root-level image
    if (!thumbnailKey) {
        throw new Error(
            `Zip for slug "${slug}" contains no root-level image file. ` +
            `Include a cover image (jpg, png, webp, etc.) at the top level of the zip.`,
        );
    }

    // ── 4. Upload all files to magazines bucket under <slug>/ ─────────────
    const uploads = fileEntries.map(async ([originalPath, data]) => {
        const strippedPath = pathMap.get(originalPath)!;
        const destKey = `${slug}/${strippedPath}`;
        const contentType = getContentType(strippedPath);

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

    // ── 5. Update DDB record ───────────────────────────────────────────────
    await dynamodb.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: "MAGAZINE", SK: slug },
            UpdateExpression: "SET #status = :status, thumbnail_key = :thumb",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "published",
                ":thumb": thumbnailKey,
            },
        }),
    );

    // ── 6. Delete staging zip ──────────────────────────────────────────────
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcKey }));

    console.log(
        `Magazine "${slug}" published successfully. ` +
        `Files: ${fileEntries.length}, Thumbnail: ${thumbnailKey}`,
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
