import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { dynamodb, s3Client, TABLE_NAME, MAGAZINES_BUCKET_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    hasMinimumRole,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

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

            if (listResp.Contents && listResp.Contents.length > 0) {
                await s3Client.send(
                    new DeleteObjectsCommand({
                        Bucket: MAGAZINES_BUCKET_NAME,
                        Delete: {
                            Objects: listResp.Contents.map((obj) => ({ Key: obj.Key! })),
                            Quiet: true,
                        },
                    }),
                );
            }

            continuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined;
        } while (continuationToken);

        // ── Delete DDB record ──────────────────────────────────────────────
        await dynamodb.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
            }),
        );

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
