import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
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

        const news_sk = event.pathParameters?.news_sk?.trim();
        if (!news_sk) {
            return CommonErrors.badRequest("news_sk is required");
        }

        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_sk },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("News item not found");
        }

        await dynamodb.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_sk },
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, news_id: existing.Item.news_id, news_sk }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error deleting news item:", error);
        return CommonErrors.internalServerError();
    }
};
