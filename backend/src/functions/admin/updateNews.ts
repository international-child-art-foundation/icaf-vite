import { GetCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    UpdateNewsRequest,
    NewsEntity,
    newsSk,
    validateUpdateNewsRequest,
    hasMinimumRole,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const UPDATABLE_FIELDS: (keyof UpdateNewsRequest)[] = [
    "source", "body", "date", "ts", "kind", "place", "link", "src",
];

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
                Key: { PK: "NEWS", SK: news_sk },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("News item not found");
        }
        const existingItem = existing.Item as NewsEntity & { PK: string; SK: string };
        const nextTs = body.ts ?? existingItem.ts;
        const nextNewsSk = newsSk(nextTs, existingItem.news_id);

        if (nextNewsSk !== news_sk) {
            const nextItem = {
                ...existingItem,
                ...body,
                SK: nextNewsSk,
                ts: nextTs,
            };

            await dynamodb.send(
                new TransactWriteCommand({
                    TransactItems: [
                        {
                            Delete: {
                                TableName: TABLE_NAME,
                                Key: { PK: "NEWS", SK: news_sk },
                                ConditionExpression: "attribute_exists(PK)",
                            },
                        },
                        {
                            Put: {
                                TableName: TABLE_NAME,
                                Item: nextItem,
                            },
                        },
                    ],
                }),
            );

            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({ success: true, news_id: existingItem.news_id, news_sk: nextNewsSk }),
                headers: COMMON_HEADERS,
            };
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
        if (setClauses.length === 0) {
            return CommonErrors.badRequest("at least one supported field must be provided");
        }

        await dynamodb.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: "NEWS", SK: news_sk },
                UpdateExpression: `SET ${setClauses.join(", ")}`,
                ExpressionAttributeNames: expressionNames,
                ExpressionAttributeValues: expressionValues,
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, news_id: existingItem.news_id, news_sk }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error updating news item:", error);
        return CommonErrors.internalServerError();
    }
};
