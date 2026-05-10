import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    CreateNewsRequest,
    NewsEntity,
    validateCreateNewsRequest,
    hasMinimumRole,
    Role,
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { randomUUID } from "crypto";

export const handler = async (
    event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        if (event.httpMethod !== "POST") {
            return CommonErrors.methodNotAllowed();
        }

        const userId = event.requestContext?.authorizer?.claims?.sub;
        const userRole = event.requestContext?.authorizer?.claims?.["custom:role"] as Role | undefined;
        if (!userId || !hasMinimumRole(userRole, "admin")) {
            return CommonErrors.forbidden("Admin access required");
        }

        const body: CreateNewsRequest = JSON.parse(event.body ?? "{}");
        const errors = validateCreateNewsRequest(body);
        if (errors.length > 0) {
            return CommonErrors.badRequest(errors.join("; "));
        }

        const news_id = randomUUID();

        const item: NewsEntity & { PK: string; SK: string } = {
            PK: "NEWS",
            SK: news_id,
            news_id,
            source: body.source,
            body: body.body,
            date: body.date,
            timestamp: body.timestamp,
            type: EntityType.News as "NEWS",
            ...(body.kind !== undefined && { kind: body.kind }),
            ...(body.place !== undefined && { place: body.place }),
            ...(body.link !== undefined && { link: body.link }),
            ...(body.src !== undefined && { src: body.src }),
        };

        await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

        return {
            statusCode: HTTP_STATUS.CREATED,
            body: JSON.stringify({ success: true, news_id }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error creating news item:", error);
        return CommonErrors.internalServerError();
    }
};
