import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  isValidArtId,
  isValidGroupId,
  isValidMagazineSlug,
  isValidNewsId,
  isValidTdrSk,
  isValidThemeFamily,
  isValidThemeInstance,
  isValidThemeSk,
  isValidUUID,
  Role,
} from "@icaf/shared";

import { handler as alterUserRole } from "../functions/admin/alterUserRole";
import { handler as adminUpdateArtwork } from "../functions/admin/adminUpdateArtwork";
import { handler as banUser } from "../functions/admin/banUser";
import { handler as cancelTakedownRequest } from "../functions/admin/cancelTakedownRequest";
import { handler as createNews } from "../functions/admin/createNews";
import { handler as deleteMagazine } from "../functions/admin/deleteMagazine";
import { handler as deleteNews } from "../functions/admin/deleteNews";
import { handler as deleteUserAccount } from "../functions/admin/deleteUserAccount";
import { handler as getArtworkSubmitterEmail } from "../functions/admin/getArtworkSubmitterEmail";
import { handler as getEmailByUserId } from "../functions/admin/getEmailByUserId";
import { handler as getTakedownRequests } from "../functions/admin/getTakedownRequests";
import { handler as getUserCognitoInfo } from "../functions/admin/getUserCognitoInfo";
import { handler as hideAllUserArtwork } from "../functions/admin/hideAllUserArtwork";
import { handler as publishMagazine } from "../functions/admin/publishMagazine";
import { handler as removeAllUserArtwork } from "../functions/admin/removeAllUserArtwork";
import { handler as unbanUser } from "../functions/admin/unbanUser";
import { handler as unhideAllUserArtwork } from "../functions/admin/unhideAllUserArtwork";
import { handler as updateMagazineStatus } from "../functions/admin/updateMagazineStatus";
import { handler as updateNews } from "../functions/admin/updateNews";
import { handler as confirmForgotPassword } from "../functions/anyone/confirmForgotPassword";
import { handler as createAndVerify } from "../functions/anyone/createAndVerify";
import { handler as confirmDefaultRegistration } from "../functions/anyone/confirmDefaultRegistration";
import { handler as forgotPassword } from "../functions/anyone/forgotPassword";
import { handler as galleryArtworks } from "../functions/anyone/gallery/galleryArtworks";
import { handler as galleryGroups } from "../functions/anyone/gallery/galleryGroups";
import { handler as galleryThemes } from "../functions/anyone/gallery/galleryThemes";
import { handler as getArtwork } from "../functions/anyone/getArtwork";
import { handler as getAuthStatus } from "../functions/anyone/getAuthStatus";
import { handler as getGroup } from "../functions/anyone/getGroup";
import { handler as getMagazines } from "../functions/anyone/getMagazines";
import { handler as getNews } from "../functions/anyone/getNews";
import { handler as initiateTakedown } from "../functions/anyone/initiateTakedown";
import { handler as login } from "../functions/anyone/login";
import { handler as logout } from "../functions/anyone/logout";
import { handler as defaultRegistration } from "../functions/anyone/defaultRegistration";
import { handler as requestCreateAndVerify } from "../functions/anyone/requestCreateAndVerify";
import { handler as resendVerification } from "../functions/anyone/resendVerificationEmail";
import { handler as guestSubmitArtwork } from "../functions/anyone/submitArtwork";
import { handler as unsubscribeArtworkEmails } from "../functions/anyone/unsubscribeArtworkEmails";
import { handler as changeArtworkStatus } from "../functions/contributor/changeArtworkStatus";
import { handler as changeGroupStatus } from "../functions/contributor/changeGroupStatus";
import { handler as createTheme } from "../functions/contributor/createTheme";
import { handler as updateTheme } from "../functions/contributor/updateTheme";
import { handler as fetchHiddenArtworks } from "../functions/contributor/fetchHiddenArtworks";
import { handler as fetchHiddenGroups } from "../functions/contributor/fetchHiddenGroups";
import { handler as fetchUnapprovedArtworks } from "../functions/contributor/fetchUnapprovedArtworks";
import { handler as fetchUnapprovedGroups } from "../functions/contributor/fetchUnapprovedGroups";
import { handler as updateUserRole } from "../functions/contributor/updateUserRole";
import { handler as createGroup } from "../functions/guardian/createGroup";
import { handler as deleteArtworkFromGroup } from "../functions/guardian/deleteArtworkFromGroup";
import { handler as deleteGroup } from "../functions/guardian/deleteGroup";
import { handler as listGroupSubmissions } from "../functions/guardian/listGroupSubmissions";
import { handler as submitArtworkToGroup } from "../functions/guardian/submitArtworkToGroup";
import { handler as updateConstituentArtwork } from "../functions/guardian/updateConstituentArtwork";
import { handler as updateGroup } from "../functions/guardian/updateGroup";
import { handler as changePassword } from "../functions/user/changePassword";
import { handler as deleteAccount } from "../functions/user/deleteAccount";
import { handler as deleteAllArtworks } from "../functions/user/deleteAllArtworks";
import { handler as deleteArtwork } from "../functions/user/deleteArtwork";
import { handler as listArtworkSubmissions } from "../functions/user/listArtworkSubmissions";
import { handler as listDonations } from "../functions/user/listDonations";
import { handler as submitArtwork } from "../functions/user/submitArtwork";
import { handler as updateArtwork } from "../functions/user/updateArtwork";
import { handler as getUser } from "../functions/user/user";
import { handler as voteArtwork } from "../functions/user/voteArtwork";
import { isApiGatewayResponse, requireAuth, requireRole } from "../utils/auth";

type Handler = (event: ApiGatewayEvent) => Promise<ApiGatewayResponse>;

type Route = {
  method: string;
  path: string;
  handler: Handler;
  auth?: {
    roles?: Role[];
  };
};

type MatchResult =
  | { ok: true; pathParameters: Record<string, string> }
  | { ok: false; response: ApiGatewayResponse };

type ApiEvent = ApiGatewayEvent & {
  path?: string;
  rawPath?: string;
};

const allowedOrigins = new Set(["https://revise.icaf.org", "http://localhost:5173"]);
const guardianRoles: Role[] = ["guardian", "contributor", "admin"];
const contributorRoles: Role[] = ["contributor", "admin"];
const adminRoles: Role[] = ["admin"];
const pathParamValidators: Record<string, (value: string) => boolean> = {
  art_id: isValidArtId,
  family: isValidThemeFamily,
  group_id: isValidGroupId,
  instance: isValidThemeInstance,
  news_id: isValidNewsId,
  slug: isValidMagazineSlug,
  tdr_sk: isValidTdrSk,
  theme_sk: isValidThemeSk,
  user_id: isValidUUID,
};

function authenticated(route: Omit<Route, "auth">): Route {
  return { ...route, auth: {} };
}

function roleProtected(route: Omit<Route, "auth">, roles: Role[]): Route {
  return { ...route, auth: { roles } };
}

const routes: Route[] = [
  { method: "POST", path: "/api/artworks", handler: guestSubmitArtwork },
  { method: "POST", path: "/api/groups", handler: createGroup },
  { method: "GET", path: "/api/artworks/{art_id}", handler: getArtwork },
  { method: "GET", path: "/api/groups/{group_id}", handler: getGroup },
  { method: "POST", path: "/api/takedown", handler: initiateTakedown },
  { method: "GET", path: "/api/magazines", handler: getMagazines },
  { method: "GET", path: "/api/news", handler: getNews },
  { method: "GET", path: "/api/gallery/artworks", handler: galleryArtworks },
  { method: "GET", path: "/api/gallery/artworks/family/{family}", handler: galleryArtworks },
  { method: "GET", path: "/api/gallery/artworks/family/{family}/instance/{instance}", handler: galleryArtworks },
  { method: "GET", path: "/api/gallery/themes", handler: galleryThemes },
  { method: "GET", path: "/api/gallery/groups", handler: galleryGroups },
  { method: "GET", path: "/api/gallery/groups/family/{family}", handler: galleryGroups },
  { method: "GET", path: "/api/gallery/groups/family/{family}/instance/{instance}", handler: galleryGroups },
  { method: "GET", path: "/api/unsubscribe/artwork", handler: unsubscribeArtworkEmails },

  { method: "POST", path: "/api/auth/default-registration", handler: defaultRegistration },
  { method: "POST", path: "/api/auth/default-registration/confirm", handler: confirmDefaultRegistration },
  { method: "POST", path: "/api/auth/login", handler: login },
  { method: "POST", path: "/api/auth/logout", handler: logout },
  { method: "POST", path: "/api/auth/create-and-verify", handler: createAndVerify },
  { method: "POST", path: "/api/auth/forgot-password", handler: forgotPassword },
  { method: "POST", path: "/api/auth/confirm-forgot-password", handler: confirmForgotPassword },
  { method: "POST", path: "/api/auth/resend-verification", handler: resendVerification },
  { method: "GET", path: "/api/auth/status", handler: getAuthStatus },
  { method: "POST", path: "/api/auth/create-and-verify/request", handler: requestCreateAndVerify },
  authenticated({ method: "POST", path: "/api/auth/change-password", handler: changePassword }),

  authenticated({ method: "GET", path: "/api/user/profile", handler: getUser }),
  authenticated({ method: "DELETE", path: "/api/user/account", handler: deleteAccount }),
  authenticated({ method: "GET", path: "/api/user/payments", handler: listDonations }),
  authenticated({ method: "GET", path: "/api/user/artworks", handler: listArtworkSubmissions }),
  authenticated({ method: "POST", path: "/api/user/artworks", handler: submitArtwork }),
  authenticated({ method: "DELETE", path: "/api/user/artworks", handler: deleteAllArtworks }),
  authenticated({ method: "PATCH", path: "/api/user/artworks/{art_id}", handler: updateArtwork }),
  authenticated({ method: "DELETE", path: "/api/user/artworks/{art_id}", handler: deleteArtwork }),
  authenticated({ method: "POST", path: "/api/user/artworks/{art_id}/kudos", handler: voteArtwork }),

  roleProtected({ method: "GET", path: "/api/guardian/groups", handler: listGroupSubmissions }, guardianRoles),
  roleProtected({ method: "PATCH", path: "/api/guardian/groups/{group_id}", handler: updateGroup }, guardianRoles),
  roleProtected({ method: "DELETE", path: "/api/guardian/groups/{group_id}", handler: deleteGroup }, guardianRoles),
  roleProtected({ method: "POST", path: "/api/guardian/groups/{group_id}/artworks", handler: submitArtworkToGroup }, guardianRoles),
  roleProtected({ method: "DELETE", path: "/api/guardian/groups/{group_id}/artworks/{art_id}", handler: deleteArtworkFromGroup }, guardianRoles),
  roleProtected({ method: "PATCH", path: "/api/guardian/artworks/{art_id}", handler: updateConstituentArtwork }, guardianRoles),

  roleProtected({ method: "GET", path: "/api/contributor/artworks/pending", handler: fetchUnapprovedArtworks }, contributorRoles),
  roleProtected({ method: "GET", path: "/api/contributor/artworks/hidden", handler: fetchHiddenArtworks }, contributorRoles),
  roleProtected({ method: "PATCH", path: "/api/contributor/artworks/{art_id}/status", handler: changeArtworkStatus }, contributorRoles),
  roleProtected({ method: "GET", path: "/api/contributor/groups/pending", handler: fetchUnapprovedGroups }, contributorRoles),
  roleProtected({ method: "GET", path: "/api/contributor/groups/hidden", handler: fetchHiddenGroups }, contributorRoles),
  roleProtected({ method: "PATCH", path: "/api/contributor/groups/{group_id}/status", handler: changeGroupStatus }, contributorRoles),
  roleProtected({ method: "PATCH", path: "/api/contributor/users/{user_id}/role", handler: updateUserRole }, contributorRoles),
  roleProtected({ method: "POST", path: "/api/contributor/themes", handler: createTheme }, contributorRoles),
  roleProtected({ method: "PATCH", path: "/api/contributor/themes/{theme_sk}", handler: updateTheme }, contributorRoles),

  roleProtected({ method: "POST", path: "/api/admin/users/{user_id}/ban", handler: banUser }, adminRoles),
  roleProtected({ method: "POST", path: "/api/admin/users/{user_id}/unban", handler: unbanUser }, adminRoles),
  roleProtected({ method: "PATCH", path: "/api/admin/users/{user_id}/role", handler: alterUserRole }, adminRoles),
  roleProtected({ method: "PATCH", path: "/api/admin/artworks/{art_id}", handler: adminUpdateArtwork }, adminRoles),
  roleProtected({ method: "GET", path: "/api/admin/users/{user_id}/cognito-info", handler: getUserCognitoInfo }, adminRoles),
  roleProtected({ method: "GET", path: "/api/admin/users/{user_id}/email", handler: getEmailByUserId }, adminRoles),
  roleProtected({ method: "DELETE", path: "/api/admin/users/{user_id}/account", handler: deleteUserAccount }, adminRoles),
  roleProtected({ method: "DELETE", path: "/api/admin/users/{user_id}/artworks", handler: removeAllUserArtwork }, adminRoles),
  roleProtected({ method: "POST", path: "/api/admin/users/{user_id}/hide-all", handler: hideAllUserArtwork }, adminRoles),
  roleProtected({ method: "POST", path: "/api/admin/users/{user_id}/unhide-all", handler: unhideAllUserArtwork }, adminRoles),
  roleProtected({ method: "GET", path: "/api/admin/artworks/{art_id}/submitter-email", handler: getArtworkSubmitterEmail }, adminRoles),
  roleProtected({ method: "GET", path: "/api/admin/takedowns", handler: getTakedownRequests }, adminRoles),
  roleProtected({ method: "PATCH", path: "/api/admin/takedowns/{tdr_sk}", handler: cancelTakedownRequest }, adminRoles),
  roleProtected({ method: "POST", path: "/api/admin/magazines", handler: publishMagazine }, adminRoles),
  roleProtected({ method: "PATCH", path: "/api/admin/magazines/{slug}/status", handler: updateMagazineStatus }, adminRoles),
  roleProtected({ method: "DELETE", path: "/api/admin/magazines/{slug}", handler: deleteMagazine }, adminRoles),
  roleProtected({ method: "POST", path: "/api/admin/news", handler: createNews }, adminRoles),
  roleProtected({ method: "PATCH", path: "/api/admin/news/{news_id}", handler: updateNews }, adminRoles),
  roleProtected({ method: "DELETE", path: "/api/admin/news/{news_id}", handler: deleteNews }, adminRoles),
];

function splitPath(path: string): string[] {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed ? trimmed.split("/") : [];
}

function hasEmptyInternalPathSegment(path: string): boolean {
  return splitPath(path).some((part) => part.length === 0);
}

function decodePathSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

function validatePathParameter(name: string, value: string): ApiGatewayResponse | null {
  if (!value.trim()) {
    return CommonErrors.badRequest(`Invalid ${name} path parameter`);
  }

  if (value.includes("/")) {
    return CommonErrors.badRequest("Malformed path");
  }

  const validator = pathParamValidators[name];
  if (validator && !validator(value)) {
    return CommonErrors.badRequest(`Invalid ${name} path parameter`);
  }

  return null;
}

function matchRoutePath(route: Route, path: string): MatchResult | null {
  const routeParts = splitPath(route.path);
  const pathParts = splitPath(path);
  if (routeParts.length !== pathParts.length) return null;

  const pathParameters: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i += 1) {
    const routePart = routeParts[i];
    const pathPart = decodePathSegment(pathParts[i] ?? "");

    if (pathPart === null) {
      return { ok: false, response: CommonErrors.badRequest("Malformed path") };
    }

    if (routePart.startsWith("{") && routePart.endsWith("}")) {
      const paramName = routePart.slice(1, -1);
      const paramError = validatePathParameter(paramName, pathPart);

      if (paramError) {
        return { ok: false, response: paramError };
      }

      pathParameters[paramName] = pathPart;
      continue;
    }

    if (routePart !== pathPart) return null;
  }

  return { ok: true, pathParameters };
}

function resolvePath(event: ApiEvent): string {
  return event.path ?? event.rawPath ?? `/${event.pathParameters?.proxy ?? ""}`;
}

function getHeader(event: ApiGatewayEvent, name: string): string | undefined {
  const headers = event.headers ?? {};
  const lowerName = name.toLowerCase();
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName);
  return entry?.[1];
}

function withCors(event: ApiGatewayEvent, response: ApiGatewayResponse): ApiGatewayResponse {
  const origin = getHeader(event, "origin");
  const allowOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : response.headers["Access-Control-Allow-Origin"] ?? "*";

  return {
    ...response,
    headers: {
      ...response.headers,
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    },
  };
}

function validateJsonBody(event: ApiEvent): ApiGatewayResponse | null {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(event.httpMethod)) {
    return null;
  }

  if (event.body === undefined || event.body === null) {
    return null;
  }

  if (event.body.trim() === "") {
    return CommonErrors.badRequest("Invalid JSON body");
  }

  try {
    const value = JSON.parse(event.body) as unknown;
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return CommonErrors.badRequest("JSON body must be an object");
    }

    return null;
  } catch {
    return CommonErrors.badRequest("Invalid JSON body");
  }
}

async function authorizeRoute(
  event: ApiGatewayEvent,
  route: Route,
): Promise<ApiGatewayResponse | null> {
  if (!route.auth) return null;

  const auth = route.auth.roles
    ? await requireRole(event, route.auth.roles)
    : await requireAuth(event);

  return isApiGatewayResponse(auth) ? auth : null;
}

export const handler = async (event: ApiEvent): Promise<ApiGatewayResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return withCors(event, {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    });
  }

  const path = resolvePath(event);
  if (hasEmptyInternalPathSegment(path)) {
    return withCors(event, CommonErrors.badRequest("Malformed path"));
  }

  const pathMatches: { route: Route; pathParameters: Record<string, string> }[] = [];
  const pathErrors: ApiGatewayResponse[] = [];

  for (const candidate of routes) {
    const match = matchRoutePath(candidate, path);

    if (match?.ok) {
      pathMatches.push({ route: candidate, pathParameters: match.pathParameters });
    } else if (match) {
      pathErrors.push(match.response);
    }
  }

  if (pathMatches.length === 0) {
    if (pathErrors.length > 0) {
      return withCors(event, pathErrors[0]);
    }

    return withCors(event, CommonErrors.notFound("Route not found"));
  }

  const route = pathMatches.find((candidate) => candidate.route.method === event.httpMethod);

  if (!route || !route.pathParameters) {
    const allowedMethods = [...new Set(pathMatches.map((candidate) => candidate.route.method))].sort();
    const response = CommonErrors.methodNotAllowed(allowedMethods);

    return withCors(event, {
      ...response,
      headers: {
        ...response.headers,
        Allow: allowedMethods.join(", "),
      },
    });
  }

  const routedEvent = {
    ...event,
    pathParameters: {
      ...(event.pathParameters ?? {}),
      ...route.pathParameters,
    },
  };

  const authError = await authorizeRoute(routedEvent, route.route);
  if (authError) {
    return withCors(routedEvent, authError);
  }

  const jsonError = validateJsonBody(routedEvent);
  if (jsonError) {
    return withCors(routedEvent, jsonError);
  }

  return withCors(routedEvent, await route.route.handler(routedEvent));
};
