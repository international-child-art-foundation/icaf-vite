import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    hasMinimumRole,
    Role,
} from "@icaf/shared";

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const userId = event.requestContext?.authorizer?.claims?.sub;
        const userRole = event.requestContext?.authorizer?.claims?.["custom:role"] as Role | undefined;
        if (!userId || !hasMinimumRole(userRole, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        const news_id = event.pathParameters?.news_id?.trim();
        if (!news_id) {
            return CommonErrors.badRequest("news_id is required");
        }

        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_id },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("News item not found");
        }

        await dynamodb.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_id },
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, news_id }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error deleting news item:", error);
        return CommonErrors.internalServerError();
    }
};
