import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    UpdateNewsRequest,
    validateUpdateNewsRequest,
    hasMinimumRole,
    Role,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

const UPDATABLE_FIELDS: (keyof UpdateNewsRequest)[] = [
    "source", "body", "date", "timestamp", "kind", "place", "link", "src",
];

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

        const parsedBody = parseJsonBody<UpdateNewsRequest>(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const body = parsedBody.value;
        const errors = validateUpdateNewsRequest(body);
        if (errors.length > 0) {
            return CommonErrors.badRequest(errors.join("; "));
        }

        // Verify item exists
        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_id },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("News item not found");
        }

        // Build UpdateExpression dynamically from provided fields
        const setClauses: string[] = [];
        const expressionNames: Record<string, string> = {};
        const expressionValues: Record<string, unknown> = {};

        for (const field of UPDATABLE_FIELDS) {
            if (body[field] !== undefined) {
                setClauses.push(`#${field} = :${field}`);
                expressionNames[`#${field}`] = field;
                expressionValues[`:${field}`] = body[field];
            }
        }

        await dynamodb.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_id },
                UpdateExpression: `SET ${setClauses.join(", ")}`,
                ExpressionAttributeNames: expressionNames,
                ExpressionAttributeValues: expressionValues,
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, news_id }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error updating news item:", error);
        return CommonErrors.internalServerError();
    }
};
