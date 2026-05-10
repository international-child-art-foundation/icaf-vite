import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    NewsEntity,
    NewsListItem,
    ListNewsResponse,
} from "@icaf/shared";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        if (event.httpMethod !== "GET") {
            return CommonErrors.methodNotAllowed();
        }

        const rawLimit = event.queryStringParameters?.limit;
        const limit = rawLimit ? Math.min(parseInt(rawLimit, 10) || DEFAULT_LIMIT, MAX_LIMIT) : DEFAULT_LIMIT;
        const lastKey = event.queryStringParameters?.last_key;
        const exclusiveStartKey = lastKey
            ? JSON.parse(Buffer.from(lastKey, "base64").toString("utf8"))
            : undefined;

        const result = await dynamodb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": "NEWS" },
                // SK = 'ID#<uuid>' — sort alphabetically by SK, client sorts by timestamp
                Limit: limit + 1,
                ExclusiveStartKey: exclusiveStartKey,
            }),
        );

        const items = (result.Items ?? []) as NewsEntity[];
        const has_more = items.length > limit;
        const page = has_more ? items.slice(0, limit) : items;

        const news: NewsListItem[] = page
            .map(({ type: _type, ...rest }) => rest as NewsListItem)
            // Newest first by timestamp
            .sort((a, b) => b.timestamp - a.timestamp);

        const last_key_out = has_more && result.LastEvaluatedKey
            ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
            : undefined;

        const response: ListNewsResponse = { news, has_more };
        if (last_key_out) (response as any).last_key = last_key_out;

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error listing news:", error);
        return CommonErrors.internalServerError();
    }
};
