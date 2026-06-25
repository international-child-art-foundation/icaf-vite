import {
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  type ApiGatewayEvent,
  type CreateGroupRequest,
  type PreflightGroupRequest,
  type PreflightGroupResponse,
  validateCreateGroupRequest,
} from "@icaf/shared";
import { randomUUID } from "crypto";
import { getOptionalAuth, getUserByEmail } from "../../utils/auth";
import { parseJsonBody } from "../../utils/request";
import { ensureThemeEntity } from "../shared/themeUtils";
import { validateMissingProfileNames } from "../shared/profileNames";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<PreflightGroupRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;

    const body = parsedBody.value;
    const auth = await getOptionalAuth(event);
    const validationBody = {
      ...body,
      artworks: Array.isArray(body.artworks)
        ? body.artworks.map((artwork) => ({
            ...artwork,
            art_id: randomUUID(),
            file_type: "jpg" as const,
          }))
        : body.artworks,
    } as CreateGroupRequest;
    const errors = validateCreateGroupRequest(validationBody, !auth);
    if (errors.length > 0) {
      return CommonErrors.badRequest(errors.join("; "));
    }
    if (auth) {
      const profileNameErrors = validateMissingProfileNames(auth, body);
      if (profileNameErrors.length > 0) {
        return CommonErrors.badRequest(profileNameErrors.join("; "));
      }
    }

    if (auth?.banned) {
      return CommonErrors.forbidden("This account is banned");
    }
    if (auth?.role === "deleting") {
      return CommonErrors.forbidden("Account deletion is pending. Contact us if you need assistance.");
    }

    if (!auth && "email" in body && body.email) {
      const existingUser = await getUserByEmail(body.email);
      if (existingUser?.banned) {
        return CommonErrors.forbidden("This account is banned");
      }
      if (existingUser && !existingUser.is_virtual) {
        return CommonErrors.conflict(
          "This account already exists. Please log in to submit artwork.",
        );
      }
    }

    const themes = [
      ...new Set(
        [body.theme, ...body.artworks.map((artwork) => artwork.theme)].filter(Boolean),
      ),
    ];
    const themeChecks = await Promise.all(
      themes.map((theme) => ensureThemeEntity({ theme })),
    );
    const failedThemeCheck = themeChecks.find((result) => !result.ok);
    if (failedThemeCheck && !failedThemeCheck.ok) {
      return failedThemeCheck.response;
    }

    const response: PreflightGroupResponse = { success: true };
    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error validating group preflight:", error);
    return CommonErrors.internalServerError();
  }
};
