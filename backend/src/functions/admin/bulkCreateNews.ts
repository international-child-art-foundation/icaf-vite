import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { getCurrentUser } from "../../utils/auth";
import {
    ApiGatewayEvent,
    ApiGatewayResponse,
    BulkCreateNewsItem,
    BulkCreateNewsRequest,
    COMMON_HEADERS,
    CommonErrors,
    CreateNewsRequest,
    HTTP_STATUS,
    NewsEntity,
    hasMinimumRole,
    newsSk,
    validateCreateNewsRequest,
} from "@icaf/shared";

const MAX_BULK_NEWS_ITEMS = 100;
const BATCH_WRITE_LIMIT = 25;
const MAX_BATCH_WRITE_ATTEMPTS = 3;

type NewsDynamoItem = NewsEntity & { PK: string; SK: string };
type NewsWriteRequest = { PutRequest: { Item: NewsDynamoItem } };

function parseBulkNewsBody(
    event: ApiGatewayEvent,
): { ok: true; value: BulkCreateNewsRequest } | { ok: false; response: ApiGatewayResponse } {
    if (event.body === undefined || event.body === null) {
        return { ok: false, response: CommonErrors.badRequest("at least one news item is required") };
    }

    if (event.body.trim() === "") {
        return { ok: false, response: CommonErrors.badRequest("Invalid JSON body") };
    }

    try {
        const value = JSON.parse(event.body) as unknown;
        if (value === null || typeof value !== "object") {
            return {
                ok: false,
                response: CommonErrors.badRequest(
                    "request body must be a news array or an object with a news array",
                ),
            };
        }

        return { ok: true, value: value as BulkCreateNewsRequest };
    } catch {
        return { ok: false, response: CommonErrors.badRequest("Invalid JSON body") };
    }
}

function extractNewsItems(
    body: BulkCreateNewsRequest,
): BulkCreateNewsItem[] | null {
    if (Array.isArray(body)) return body;
    if (body && typeof body === "object" && Array.isArray(body.news)) return body.news;
    return null;
}

function tsFromDate(
    date: string | undefined,
    fallbackOffset: number,
): number {
    if (date) {
        const parsed = Date.parse(date);
        if (!Number.isNaN(parsed)) {
            return Math.floor(parsed / 1000);
        }
    }

    return Math.floor(Date.now() / 1000) - fallbackOffset;
}

function normalizeItem(item: BulkCreateNewsItem, index: number): CreateNewsRequest {
    return {
        ...item,
        ts: item.ts ?? tsFromDate(item.date, index),
    };
}

function toDynamoItem(item: CreateNewsRequest, news_id: string): NewsDynamoItem {
    return {
        PK: "NEWS",
        SK: newsSk(item.ts, news_id),
        news_id,
        source: item.source,
        ts: item.ts,
        type: EntityType.News as "NEWS",
        ...(item.body !== undefined && { body: item.body }),
        ...(item.date !== undefined && { date: item.date }),
        ...(item.kind !== undefined && { kind: item.kind }),
        ...(item.place !== undefined && { place: item.place }),
        ...(item.link !== undefined && { link: item.link }),
        ...(item.src !== undefined && { src: item.src }),
    };
}

async function writeBatch(writeRequests: NewsWriteRequest[]) {
    let pending = writeRequests;

    for (
        let attempt = 0;
        attempt < MAX_BATCH_WRITE_ATTEMPTS && pending.length > 0;
        attempt += 1
    ) {
        const result = await dynamodb.send(
            new BatchWriteCommand({
                RequestItems: {
                    [TABLE_NAME]: pending,
                },
            }),
        );

        pending = (result.UnprocessedItems?.[TABLE_NAME] ?? []) as NewsWriteRequest[];
    }

    if (pending.length > 0) {
        throw new Error("DynamoDB did not process all news items");
    }
}

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const currentUser = await getCurrentUser(event);
        if (!currentUser.ok) return currentUser.response;
        if (!hasMinimumRole(currentUser.user.role, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        const parsedBody = parseBulkNewsBody(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const rawItems = extractNewsItems(parsedBody.value);
        if (!rawItems) {
            return CommonErrors.badRequest(
                "request body must be a news array or an object with a news array",
            );
        }
        if (rawItems.length === 0) {
            return CommonErrors.badRequest("at least one news item is required");
        }
        if (rawItems.length > MAX_BULK_NEWS_ITEMS) {
            return CommonErrors.badRequest(
                `bulk news uploads are limited to ${MAX_BULK_NEWS_ITEMS} items`,
            );
        }

        const normalizedItems = rawItems.map(normalizeItem);
        const validationErrors = normalizedItems.flatMap((item, index) =>
            validateCreateNewsRequest(item).map(
                (error) => `item ${index + 1}: ${error}`,
            ),
        );
        if (validationErrors.length > 0) {
            return CommonErrors.badRequest(validationErrors.join("; "));
        }

        const news_ids = normalizedItems.map(() => randomUUID());
        const writeRequests = normalizedItems.map((item, index) => ({
            PutRequest: {
                Item: toDynamoItem(item, news_ids[index]),
            },
        }));

        for (let i = 0; i < writeRequests.length; i += BATCH_WRITE_LIMIT) {
            await writeBatch(writeRequests.slice(i, i + BATCH_WRITE_LIMIT));
        }

        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({
                success: true,
                count: news_ids.length,
                news_ids,
            }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error bulk creating news items:", error);
        return CommonErrors.internalServerError();
    }
};
