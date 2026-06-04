import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import {
    dynamodb,
    s3Client,
    TABLE_NAME,
    MAGAZINES_BUCKET_NAME,
} from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    InitiateMagazineUploadRequest,
    InitiateMagazineUploadResponse,
    validateInitiateMagazineUploadRequest,
    hasMinimumRole,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

// Presigned URL expires in 30 minutes — zip uploads can be large
const PRESIGNED_URL_EXPIRES_SECONDS = 30 * 60;

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        // ── Auth check ─────────────────────────────────────────────────────
        const currentUser = await getCurrentUser(event);
        if (!currentUser.ok) return currentUser.response;
        if (!hasMinimumRole(currentUser.user.role, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        // ── Validate request ───────────────────────────────────────────────
        const parsedBody = parseJsonBody<InitiateMagazineUploadRequest>(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const body = parsedBody.value;
        const errors = validateInitiateMagazineUploadRequest(body);
        if (errors.length > 0) {
            return CommonErrors.badRequest(errors.join("; "));
        }

        const { slug, name, period, volume, userId } = body;
        const now = Math.floor(Date.now() / 1000);

        // ── Write MAGAZINE record to DDB (status=processing) ───────────────
        // Using PutCommand so this also acts as an upsert for re-uploads of the same slug.
        await dynamodb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: {
                    PK: "MAGAZINE",
                    SK: slug,
                    slug,
                    name,
                    period,
                    volume,
                    status: "processing",
                    uploaded_by: userId,
                    ts: now,
                    type: EntityType.Magazine,
                },
            }),
        );

        // ── Generate presigned PUT URL for the zip ─────────────────────────
        // The processZip Lambda is triggered when this object is created.
        const presignedUrl = await getSignedUrl(
            s3Client,
            new PutObjectCommand({
                Bucket: MAGAZINES_BUCKET_NAME,
                Key: `staging/${slug}.zip`,
                ContentType: "application/zip",
            }),
            { expiresIn: PRESIGNED_URL_EXPIRES_SECONDS },
        );

        const response: InitiateMagazineUploadResponse = {
            success: true,
            slug,
            presigned_url: presignedUrl,
            message: `Upload the magazine zip to the presigned URL. Processing begins automatically on upload.`,
        };

        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify(response),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error initiating magazine upload:", error);
        return CommonErrors.internalServerError();
    }
};
