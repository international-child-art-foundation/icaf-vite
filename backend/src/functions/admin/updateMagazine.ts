import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
    ApiGatewayEvent,
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    UpdateMagazineRequest,
    validateUpdateMagazineRequest,
    hasMinimumRole,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const UPDATABLE_FIELDS: (keyof UpdateMagazineRequest)[] = ["name", "period", "volume"];

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

        const parsedBody = parseJsonBody<UpdateMagazineRequest>(event);
        if (!parsedBody.ok) {
            return parsedBody.response;
        }

        const body = parsedBody.value;
        const errors = validateUpdateMagazineRequest(body);
        if (errors.length > 0) {
            return CommonErrors.badRequest(errors.join("; "));
        }

        const existing = await dynamodb.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
            }),
        );
        if (!existing.Item) {
            return CommonErrors.notFound("Magazine not found");
        }

        const setClauses: string[] = [];
        const expressionNames: Record<string, string> = {};
        const expressionValues: Record<string, string> = {};

        for (const field of UPDATABLE_FIELDS) {
            const value = body[field];
            if (value !== undefined) {
                setClauses.push(`#${field} = :${field}`);
                expressionNames[`#${field}`] = field;
                expressionValues[`:${field}`] = value.trim();
            }
        }

        await dynamodb.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: { PK: "MAGAZINE", SK: slug },
                UpdateExpression: `SET ${setClauses.join(", ")}`,
                ExpressionAttributeNames: expressionNames,
                ExpressionAttributeValues: expressionValues,
            }),
        );

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({ success: true, slug }),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error updating magazine:", error);
        return CommonErrors.internalServerError();
    }
};
