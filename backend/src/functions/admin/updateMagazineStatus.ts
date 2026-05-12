import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    MagazineStatus,
    hasMinimumRole,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const VALID_STATUSES: MagazineStatus[] = ["published", "unpublished"];

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

        const parsedBody = parseJsonBody<{ status?: MagazineStatus }>(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const body = parsedBody.value;
        if (!body.status || !VALID_STATUSES.includes(body.status)) {
            return CommonErrors.badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
        }

        // Verify the magazine exists and is not in 'processing' state
        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
            }),
        );

        if (!existing.Item) {
            return CommonErrors.notFound("Magazine not found");
        }
        if (existing.Item.status === "processing") {
            return CommonErrors.conflict("Magazine is still processing; wait for upload to complete");
        }

        await dynamodb.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
                UpdateExpression: "SET #status = :status",
                ExpressionAttributeNames: { "#status": "status" },
                ExpressionAttributeValues: { ":status": body.status },
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, slug, status: body.status }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error updating magazine status:", error);
        return CommonErrors.internalServerError();
    }
};
