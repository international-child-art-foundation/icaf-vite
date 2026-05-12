import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
} from "@icaf/shared";

import { handler as alterUserRole } from "../functions/admin/alterUserRole";
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
import { handler as confirmRegistration } from "../functions/anyone/confirmRegistration";
import { handler as forgotPassword } from "../functions/anyone/forgotPassword";
import { handler as galleryArtworks } from "../functions/anyone/gallery/galleryArtworks";
import { handler as galleryGroups } from "../functions/anyone/gallery/galleryGroups";
import { handler as getArtwork } from "../functions/anyone/getArtwork";
import { handler as getAuthStatus } from "../functions/anyone/getAuthStatus";
import { handler as getGroup } from "../functions/anyone/getGroup";
import { handler as getMagazines } from "../functions/anyone/getMagazines";
import { handler as getNews } from "../functions/anyone/getNews";
import { handler as initiateTakedown } from "../functions/anyone/initiateTakedown";
import { handler as login } from "../functions/anyone/login";
import { handler as logout } from "../functions/anyone/logout";
import { handler as register } from "../functions/anyone/register";
import { handler as requestCreateAndVerify } from "../functions/anyone/requestCreateAndVerify";
import { handler as resendVerification } from "../functions/anyone/resendVerificationEmail";
import { handler as guestSubmitArtwork } from "../functions/anyone/submitArtwork";
import { handler as verifyAccount } from "../functions/anyone/verifyAccount";
import { handler as changeArtworkStatus } from "../functions/contributor/changeArtworkStatus";
import { handler as changeGroupStatus } from "../functions/contributor/changeGroupStatus";
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

type Handler = (event: ApiGatewayEvent) => Promise<ApiGatewayResponse>;

type Route = {
  method: string;
  path: string;
  handler: Handler;
};

type ApiEvent = ApiGatewayEvent & {
  path?: string;
  rawPath?: string;
};

const routes: Route[] = [
  { method: "POST", path: "/artworks", handler: guestSubmitArtwork },
  { method: "GET", path: "/artworks/{art_id}", handler: getArtwork },
  { method: "GET", path: "/groups/{group_id}", handler: getGroup },
  { method: "POST", path: "/takedown", handler: initiateTakedown },
  { method: "GET", path: "/magazines", handler: getMagazines },
  { method: "GET", path: "/news", handler: getNews },
  { method: "GET", path: "/gallery/artworks", handler: galleryArtworks },
  { method: "GET", path: "/gallery/artworks/family/{family}", handler: galleryArtworks },
  { method: "GET", path: "/gallery/artworks/family/{family}/instance/{instance}", handler: galleryArtworks },
  { method: "GET", path: "/gallery/groups", handler: galleryGroups },
  { method: "GET", path: "/gallery/groups/family/{family}", handler: galleryGroups },
  { method: "GET", path: "/gallery/groups/family/{family}/instance/{instance}", handler: galleryGroups },

  { method: "POST", path: "/auth/register", handler: register },
  { method: "POST", path: "/auth/confirm-registration", handler: confirmRegistration },
  { method: "POST", path: "/auth/login", handler: login },
  { method: "POST", path: "/auth/logout", handler: logout },
  { method: "POST", path: "/auth/verify", handler: verifyAccount },
  { method: "POST", path: "/auth/forgot-password", handler: forgotPassword },
  { method: "POST", path: "/auth/confirm-forgot-password", handler: confirmForgotPassword },
  { method: "POST", path: "/auth/resend-verification", handler: resendVerification },
  { method: "GET", path: "/auth/status", handler: getAuthStatus },
  { method: "POST", path: "/auth/create-and-verify", handler: requestCreateAndVerify },
  { method: "POST", path: "/auth/change-password", handler: changePassword },

  { method: "GET", path: "/user/profile", handler: getUser },
  { method: "DELETE", path: "/user/account", handler: deleteAccount },
  { method: "GET", path: "/user/payments", handler: listDonations },
  { method: "GET", path: "/user/artworks", handler: listArtworkSubmissions },
  { method: "POST", path: "/user/artworks", handler: submitArtwork },
  { method: "DELETE", path: "/user/artworks", handler: deleteAllArtworks },
  { method: "PATCH", path: "/user/artworks/{art_id}", handler: updateArtwork },
  { method: "DELETE", path: "/user/artworks/{art_id}", handler: deleteArtwork },
  { method: "POST", path: "/user/artworks/{art_id}/kudos", handler: voteArtwork },

  { method: "GET", path: "/guardian/groups", handler: listGroupSubmissions },
  { method: "POST", path: "/guardian/groups", handler: createGroup },
  { method: "PATCH", path: "/guardian/groups/{group_id}", handler: updateGroup },
  { method: "DELETE", path: "/guardian/groups/{group_id}", handler: deleteGroup },
  { method: "POST", path: "/guardian/groups/{group_id}/artworks", handler: submitArtworkToGroup },
  { method: "DELETE", path: "/guardian/groups/{group_id}/artworks/{art_id}", handler: deleteArtworkFromGroup },
  { method: "PATCH", path: "/guardian/artworks/{art_id}", handler: updateConstituentArtwork },

  { method: "GET", path: "/contributor/artworks/pending", handler: fetchUnapprovedArtworks },
  { method: "GET", path: "/contributor/artworks/hidden", handler: fetchHiddenArtworks },
  { method: "PATCH", path: "/contributor/artworks/{art_id}/status", handler: changeArtworkStatus },
  { method: "GET", path: "/contributor/groups/pending", handler: fetchUnapprovedGroups },
  { method: "GET", path: "/contributor/groups/hidden", handler: fetchHiddenGroups },
  { method: "PATCH", path: "/contributor/groups/{group_id}/status", handler: changeGroupStatus },
  { method: "PATCH", path: "/contributor/users/{user_id}/role", handler: updateUserRole },

  { method: "POST", path: "/admin/users/{user_id}/ban", handler: banUser },
  { method: "POST", path: "/admin/users/{user_id}/unban", handler: unbanUser },
  { method: "PATCH", path: "/admin/users/{user_id}/role", handler: alterUserRole },
  { method: "GET", path: "/admin/users/{user_id}/cognito-info", handler: getUserCognitoInfo },
  { method: "GET", path: "/admin/users/{user_id}/email", handler: getEmailByUserId },
  { method: "DELETE", path: "/admin/users/{user_id}/account", handler: deleteUserAccount },
  { method: "DELETE", path: "/admin/users/{user_id}/artworks", handler: removeAllUserArtwork },
  { method: "POST", path: "/admin/users/{user_id}/hide-all", handler: hideAllUserArtwork },
  { method: "POST", path: "/admin/users/{user_id}/unhide-all", handler: unhideAllUserArtwork },
  { method: "GET", path: "/admin/artworks/{art_id}/submitter-email", handler: getArtworkSubmitterEmail },
  { method: "GET", path: "/admin/takedowns", handler: getTakedownRequests },
  { method: "PATCH", path: "/admin/takedowns/{tdr_sk}", handler: cancelTakedownRequest },
  { method: "POST", path: "/admin/magazines", handler: publishMagazine },
  { method: "PATCH", path: "/admin/magazines/{slug}/status", handler: updateMagazineStatus },
  { method: "DELETE", path: "/admin/magazines/{slug}", handler: deleteMagazine },
  { method: "POST", path: "/admin/news", handler: createNews },
  { method: "PATCH", path: "/admin/news/{news_id}", handler: updateNews },
  { method: "DELETE", path: "/admin/news/{news_id}", handler: deleteNews },
];

function splitPath(path: string): string[] {
  return path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
}

function matchRoutePath(route: Route, path: string): Record<string, string> | null {
  const routeParts = splitPath(route.path);
  const pathParts = splitPath(path);
  if (routeParts.length !== pathParts.length) return null;

  const pathParameters: Record<string, string> = {};

  for (let i = 0; i < routeParts.length; i += 1) {
    const routePart = routeParts[i];
    const pathPart = decodeURIComponent(pathParts[i] ?? "");

    if (routePart.startsWith("{") && routePart.endsWith("}")) {
      pathParameters[routePart.slice(1, -1)] = pathPart;
      continue;
    }

    if (routePart !== pathPart) return null;
  }

  return pathParameters;
}

function resolvePath(event: ApiEvent): string {
  return event.path ?? event.rawPath ?? `/${event.pathParameters?.proxy ?? ""}`;
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

export const handler = async (event: ApiEvent): Promise<ApiGatewayResponse> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  }

  const path = resolvePath(event);
  const pathMatches = routes
    .map((candidate) => ({
      route: candidate,
      pathParameters: matchRoutePath(candidate, path),
    }))
    .filter((candidate) => candidate.pathParameters !== null);

  if (pathMatches.length === 0) {
    return CommonErrors.notFound("Route not found");
  }

  const route = pathMatches.find((candidate) => candidate.route.method === event.httpMethod);

  if (!route || !route.pathParameters) {
    const allowedMethods = [...new Set(pathMatches.map((candidate) => candidate.route.method))].sort();
    const response = CommonErrors.methodNotAllowed(allowedMethods);

    return {
      ...response,
      headers: {
        ...response.headers,
        Allow: allowedMethods.join(", "),
      },
    };
  }

  const jsonError = validateJsonBody(event);
  if (jsonError) {
    return jsonError;
  }

  return route.route.handler({
    ...event,
    pathParameters: {
      ...(event.pathParameters ?? {}),
      ...route.pathParameters,
    },
  });
};
