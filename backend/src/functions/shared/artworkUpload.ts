import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CreateArtworkUploadResponse, UploadFileType, isValidUploadFileType } from "@icaf/shared";
import { randomUUID } from "crypto";
import { s3Client, S3_BUCKET_NAME } from "../../config/aws-clients";

const PRESIGNED_URL_EXPIRES_SECONDS = 20 * 60;

const CONTENT_TYPES: Record<UploadFileType, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

export function artworkInitialKey(artId: string): string {
  return `${artId}/initial`;
}

export function contentTypeForUpload(fileType: UploadFileType): string {
  return CONTENT_TYPES[fileType];
}

export async function createArtworkUpload(fileType: string): Promise<CreateArtworkUploadResponse> {
  if (!isValidUploadFileType(fileType)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  const artId = randomUUID();
  const presignedUrl = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: artworkInitialKey(artId),
      ContentType: contentTypeForUpload(fileType),
    }),
    { expiresIn: PRESIGNED_URL_EXPIRES_SECONDS },
  );

  return {
    success: true,
    art_id: artId,
    presigned_url: presignedUrl,
    message: "Upload your image using the presigned URL before submitting artwork details.",
  };
}

export async function hasUploadedArtworkImage(artId: string): Promise<boolean> {
  try {
    const result = await s3Client.send(
      new HeadObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: artworkInitialKey(artId),
      }),
    );

    return typeof result.ContentLength === "number" && result.ContentLength > 0;
  } catch (error) {
    const maybeError = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (maybeError.name === "NotFound" || maybeError.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}
