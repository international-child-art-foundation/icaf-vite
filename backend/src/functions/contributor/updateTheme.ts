import { getCurrentUser } from "@/utils/auth";
import { parseJsonBody } from "@/utils/request";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  PatchTheme,
  hasMinimumRole,
  sanitizeThemePartial,
  validateThemePartial,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "@/config/aws-clients";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const UPDATABLE_FIELDS: (keyof Pick<
  PatchTheme,
  "display_name" | "description" | "featured_on" | "start_date"
>)[] = ["display_name", "description", "featured_on", "start_date"];

export const handler = async(event: ApiGatewayEvent): Promise<ApiGatewayResponse> =>  {
  try {
    const parsedBody = parseJsonBody<PatchTheme>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "contributor")) {
        return CommonErrors.forbidden("Contributor access required");
    }

    const body = sanitizeThemePartial(parsedBody.value);
    const errors = validateThemePartial(body);
    if (errors.length > 0) {
      return CommonErrors.badRequest(errors.join("; "));
    }

    const themeSk = event.pathParameters?.theme_sk?.trim();
    if (!themeSk) {
      return CommonErrors.badRequest("theme_sk path parameter is required");
    }

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
      return CommonErrors.badRequest("At least one theme field must be provided");
    }

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: "THEME", SK: themeSk },
        UpdateExpression: `SET ${setClauses.join(", ")}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        success: true,
        message: "Theme successfully updated.",
      }),
      headers: COMMON_HEADERS,
    };
  }
  catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Theme not found");
    }

    console.error("Error patching theme:", error)
    return CommonErrors.internalServerError();
  }
}
