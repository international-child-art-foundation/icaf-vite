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
} from "@icaf/shared";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { randomUUID } from "crypto";
import { parseJsonBody } from "../../utils/request";
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

        const parsedBody = parseJsonBody<CreateNewsRequest>(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const body = parsedBody.value;
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
