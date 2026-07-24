import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
    ListObjectsV2Command,
    DeleteObjectsCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import {
    cloudFrontClient,
    dynamodb,
    s3Client,
    TABLE_NAME,
    MAGAZINES_BUCKET_NAME,
    MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID,
} from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    hasMinimumRole,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

async function invalidateMagazineCache(slug: string): Promise<void> {
    if (!MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID) return;

    await cloudFrontClient.send(
        new CreateInvalidationCommand({
            DistributionId: MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID,
            InvalidationBatch: {
                CallerReference: `delete-${slug}-${Date.now()}`,
                Paths: {
                    Quantity: 2,
                    Items: [`/${slug}`, `/${slug}/*`],
                },
            },
        }),
    );
}

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const currentUser = await getCurrentUser(event);
        if (!currentUser.ok) return currentUser.response;
        if (!hasMinimumRole(currentUser.user.role, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        const slug = event.pathParameters?.slug?.trim();
        if (!slug) {
            return CommonErrors.badRequest("Magazine slug is required");
        }

        // Verify existence
        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("Magazine not found");
        }

        // ── Delete all S3 objects under this slug prefix ───────────────────
        // This includes the magazine HTML, assets, and thumbnail.
        let continuationToken: string | undefined;
        do {
            const listResp = await s3Client.send(
                new ListObjectsV2Command({
                    Bucket: MAGAZINES_BUCKET_NAME,
                    Prefix: `${slug}/`,
                    ContinuationToken: continuationToken,
                }),
            );

            const objects = (listResp.Contents ?? [])
                .map((obj) => obj.Key)
                .filter((key): key is string => Boolean(key));

            if (objects.length > 0) {
                const deleteResp = await s3Client.send(
                    new DeleteObjectsCommand({
                        Bucket: MAGAZINES_BUCKET_NAME,
                        Delete: {
                            Objects: objects.map((Key) => ({ Key })),
                            Quiet: true,
                        },
                    }),
                );
                if (deleteResp.Errors && deleteResp.Errors.length > 0) {
                    throw new Error(
                        `Failed to delete ${deleteResp.Errors.length} magazine S3 object(s) for ${slug}`,
                    );
                }
            }

            continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
        } while (continuationToken);

        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: MAGAZINES_BUCKET_NAME,
                Key: `staging/${slug}.zip`,
            }),
        );

        // ── Delete DDB record ──────────────────────────────────────────────
        await dynamodb.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
            }),
        );

        await invalidateMagazineCache(slug);

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, slug }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error deleting magazine:", error);
        return CommonErrors.internalServerError();
    }
};
