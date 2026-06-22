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
import { parseBase64JsonObject } from "../../utils/request";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 50;

type NewsDynamoItem = NewsEntity & { PK: string; SK: string };

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const rawLimit = event.queryStringParameters?.limit;
        const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_LIMIT;
        const limit = Math.min(Math.max(parsedLimit || DEFAULT_LIMIT, 1), MAX_LIMIT);
        const lastKey = event.queryStringParameters?.last_key;
        const parsedLastKey = lastKey ? parseBase64JsonObject(lastKey, "last_key is invalid") : undefined;
        if (parsedLastKey && !parsedLastKey.ok) {
            return parsedLastKey.response;
        }
        const exclusiveStartKey = parsedLastKey?.value;

        const result = await dynamodb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": "NEWS" },
                Limit: limit + 1,
                ExclusiveStartKey: exclusiveStartKey,
                ScanIndexForward: false,
            }),
        );

        const items = (result.Items ?? []) as NewsDynamoItem[];
        const has_more = items.length > limit;
        const page = has_more ? items.slice(0, limit) : items;

        const news: NewsListItem[] = page
            .map(({ PK: _pk, SK, type: _type, ...rest }) => ({
                ...rest,
                news_sk: SK,
            }));

        const nextStartKey = has_more && page.length > 0
            ? { PK: page[page.length - 1].PK, SK: page[page.length - 1].SK }
            : undefined;
        const last_key_out = nextStartKey
            ? Buffer.from(JSON.stringify(nextStartKey)).toString("base64")
            : undefined;

        const response: ListNewsResponse = {
            news,
            has_more,
            ...(last_key_out ? { last_key: last_key_out } : {}),
        };

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
