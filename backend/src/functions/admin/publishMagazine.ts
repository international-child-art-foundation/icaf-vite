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
    Role,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";

// Presigned URL expires in 30 minutes — zip uploads can be large
const PRESIGNED_URL_EXPIRES_SECONDS = 30 * 60;

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        if (event.httpMethod !== "POST") {
            return CommonErrors.methodNotAllowed();
        }

        // ── Auth check ─────────────────────────────────────────────────────
        const userId = event.requestContext?.authorizer?.claims?.sub;
        const userRole = event.requestContext?.authorizer?.claims?.["custom:role"] as Role | undefined;
        if (!userId || !hasMinimumRole(userRole, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        // ── Validate request ───────────────────────────────────────────────
        const body: InitiateMagazineUploadRequest = JSON.parse(event.body ?? "{}");
        const errors = validateInitiateMagazineUploadRequest(body);
        if (errors.length > 0) {
            return CommonErrors.badRequest(errors.join("; "));
        }

        const { slug, name, period, volume } = body;
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
                    created_at: now,
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
