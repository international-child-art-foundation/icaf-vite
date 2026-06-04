import { getCurrentUser } from "@/utils/auth";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE_NAME, dynamodb } from "@/config/aws-clients";
import { parseJsonBody } from "@/utils/request";
import { HTTP_STATUS, COMMON_HEADERS, CommonErrors, ApiGatewayEvent, ApiGatewayResponse, ThemeEntity, createThemeResponse, buildThemeSK, hasMinimumRole, sanitizeThemeEntity, validateThemeEntity } from "@icaf/shared";

export const handler = async(event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const parsedBody = parseJsonBody<ThemeEntity>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const body = sanitizeThemeEntity(parsedBody.value);
    const errors = validateThemeEntity({
      ...body,
      type: "THEME",
    });
    if (errors.length > 0) {
      return CommonErrors.badRequest(errors.join("; "));
    }

    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "contributor")) {
        return CommonErrors.forbidden("Contributor access required");
    }

    const themeSk = buildThemeSK(body.theme_family, body.theme_instance);

    await dynamodb.send(
      new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `THEME`,
        SK: themeSk,
        type: `THEME`,
        theme_family: body.theme_family,
        theme_instance: body.theme_instance,
        display_name: body.display_name,
        featured_on: body.featured_on,
        colors: body.colors,
        ...(body.description && {description: body.description}),
        f_img_url: body.f_img_url,
        ...(body.i_img_url && {i_img_url: body.i_img_url}),
      },
        ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
    })
  )

  const response: createThemeResponse = {
    success: true,
    message: `Theme ${body.display_name} successfully created.`
  }
  return {
    statusCode: HTTP_STATUS.CREATED,
    body: JSON.stringify(response),
    headers: COMMON_HEADERS,
  };

  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
    return CommonErrors.conflict?.("Theme already exists.") ?? {
      statusCode: HTTP_STATUS.CONFLICT,
      body: JSON.stringify({
        success: false,
        message: "Theme already exists.",
      }),
      headers: COMMON_HEADERS,
    };
  }
    console.error("Error creating theme:", error);
    return CommonErrors.internalServerError();
  }
}
