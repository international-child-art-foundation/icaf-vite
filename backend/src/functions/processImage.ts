/**
 * ProcessImage Lambda
 *
 * Triggered by: S3 ObjectCreated on {art_id}/initial → SQS → this Lambda
 *
 * Reads the source file at:
 *   {art_id}/initial        ← uploaded by the client (no extension; format auto-detected)
 *
 * Produces three AVIF outputs at consistent, predictable keys:
 *   {art_id}/original.avif  — longest side ≤ 2400px (full-quality view)
 *   {art_id}/medium.avif    — longest side ≤ 800px  (detail view)
 *   {art_id}/thumb.avif     — longest side ≤ 400px  (gallery cards)
 *
 * Then deletes {art_id}/initial. Only the three avifs remain.
 * Sharp auto-detects the image format from the file buffer — no extension needed.
 *
 * INFRASTRUCTURE NOTE:
 *   Sharp requires a Lambda Layer compiled for Amazon Linux 2 with libvips ≥ 8.13
 *   and AVIF/heif codec support. See infra-stack.ts SharpLayer.
 */

import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import sharp from "sharp";
import type { SQSEvent, SQSRecord } from "aws-lambda";
import { S3_MAX_FILE_SIZE_BYTES } from "@icaf/shared";

const s3 = new S3Client({ region: process.env.AWS_REGION });

// Longest-side caps for each output tier
const SIZES = {
  original: 2400,
  medium: 800,
  thumb: 400,
} as const;

const AVIF_QUALITY = 80;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function processRecord(record: SQSRecord): Promise<void> {
  // SQS body contains a serialised S3 event
  const s3Event = JSON.parse(record.body);
  const s3Record = s3Event.Records?.[0];
  if (!s3Record) {
    console.warn("No S3 record found in SQS message — skipping.");
    return;
  }

  const bucket = s3Record.s3.bucket.name as string;
  const srcKey = decodeURIComponent((s3Record.s3.object.key as string).replace(/\+/g, " "));

  // Key must be {art_id}/initial
  if (!srcKey.endsWith("/initial")) {
    console.warn(`Unexpected key "${srcKey}" — skipping.`);
    return;
  }

  const artId = srcKey.slice(0, -"/initial".length);

  // ── Download source ────────────────────────────────────────────────────
  const getRes = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: srcKey }));
  if (
    typeof getRes.ContentLength !== "number" ||
    getRes.ContentLength < 1 ||
    getRes.ContentLength > S3_MAX_FILE_SIZE_BYTES
  ) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcKey }));
    console.warn(`Deleted invalid-size upload ${srcKey} (${getRes.ContentLength ?? "unknown"} bytes)`);
    return;
  }
  if (!(getRes.Body instanceof Readable)) {
    throw new Error(`S3 body for key "${srcKey}" is not a readable stream`);
  }
  const srcBuffer = await streamToBuffer(getRes.Body as Readable);

  // ── Produce AVIF variants (Sharp auto-detects input format) ───────────
  for (const [name, maxPx] of Object.entries(SIZES) as [keyof typeof SIZES, number][]) {
    const dstKey = `${artId}/${name}.avif`;

    const outputBuffer = await sharp(srcBuffer)
      .resize({
        width: maxPx,
        height: maxPx,
        fit: "inside",
        withoutEnlargement: true,
      })
      .avif({ quality: AVIF_QUALITY })
      .toBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: dstKey,
        Body: outputBuffer,
        ContentType: "image/avif",
      }),
    );

    console.log(`Uploaded ${dstKey} (${outputBuffer.byteLength} bytes)`);
  }

  // ── Delete the source upload ───────────────────────────────────────────
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: srcKey }));
  console.log(`Deleted source ${srcKey}`);
}

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log(`ProcessImage received ${event.Records.length} record(s)`);

  // Process records sequentially — Lambda concurrency handles parallelism at the invocation level
  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (err) {
      console.error(`Failed to process SQS record ${record.messageId}:`, err);
      // Re-throwing causes the message to return to the queue / DLQ
      throw err;
    }
  }
};
