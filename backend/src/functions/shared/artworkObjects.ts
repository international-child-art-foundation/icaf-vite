import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import {
  ARTWORK_CLOUDFRONT_DISTRIBUTION_ID,
  cloudFrontClient,
  s3Client,
  S3_BUCKET_NAME,
} from "../../config/aws-clients";

export async function deleteArtworkObjects(artId: string): Promise<void> {
  let continuationToken: string | undefined;

  do {
    const listed = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: `${artId}/`,
        ContinuationToken: continuationToken,
      }),
    );
    const objects = (listed.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key));

    if (objects.length > 0) {
      const deleted = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: objects.map((Key) => ({ Key })) },
        }),
      );
      if (deleted.Errors?.length) {
        throw new Error(`Failed to delete ${deleted.Errors.length} artwork object(s)`);
      }
    }

    continuationToken = listed.NextContinuationToken;
  } while (continuationToken);
}

export async function invalidateArtworkPaths(artIds: string[]): Promise<void> {
  if (!ARTWORK_CLOUDFRONT_DISTRIBUTION_ID || artIds.length === 0) return;

  for (let index = 0; index < artIds.length; index += 3000) {
    const batch = artIds.slice(index, index + 3000);
    await cloudFrontClient.send(
      new CreateInvalidationCommand({
        DistributionId: ARTWORK_CLOUDFRONT_DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `artwork-delete-${Date.now()}-${index}-${Math.random()}`,
          Paths: {
            Quantity: batch.length,
            Items: batch.map((artId) => `/${artId}/*`),
          },
        },
      }),
    );
  }
}
