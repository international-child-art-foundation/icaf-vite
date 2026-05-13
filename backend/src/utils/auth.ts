import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  CommonErrors,
  Role,
  ROLES,
  UserEntity,
} from "@icaf/shared";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "../config/aws-clients";
import { EntityType, GSI } from "../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../dynamo/emailGsi";
import { parseCookies } from "./cookies";

const AUTH_CACHE = new WeakMap<ApiGatewayEvent, ResolvedAuth>();
const idTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "id",
  clientId: USER_POOL_CLIENT_ID,
});
const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: "access",
  clientId: USER_POOL_CLIENT_ID,
});

type ResolvedAuth = {
  auth: AuthContext;
  user: UserEntity;
};

export type AuthContext = {
  user_id: string;
  email: string;
  role: Role;
  banned: boolean;
};

export type CurrentUserResult =
  | { ok: true; user: UserEntity; email: string; auth: AuthContext }
  | { ok: false; response: ApiGatewayResponse };

function getCookieHeader(event: ApiGatewayEvent): string | undefined {
  const headers = event.headers ?? {};
  return headers.Cookie ?? headers.cookie;
}

async function getEmailFromAccessToken(accessToken: string): Promise<string | undefined> {
  const result = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));
  return result.UserAttributes?.find((attribute) => attribute.Name === "email")?.Value?.trim();
}

function normalizeRole(role: UserEntity["role"]): Role {
  return role && (ROLES as readonly string[]).includes(role) ? role : "user";
}

function getAuthCookies(event: ApiGatewayEvent): { idToken?: string; accessToken?: string } {
  const cookies = parseCookies(getCookieHeader(event));
  return {
    idToken: cookies.idToken,
    accessToken: cookies.accessToken,
  };
}

async function resolveAuth(event: ApiGatewayEvent): Promise<ResolvedAuth | null> {
  const cached = AUTH_CACHE.get(event);
  if (cached) return cached;

  const { idToken, accessToken } = getAuthCookies(event);
  let email: string | undefined;

  if (idToken) {
    try {
      const idClaims = await idTokenVerifier.verify(idToken);
      email = typeof idClaims.email === "string" ? idClaims.email.trim() : undefined;
    } catch {
      email = undefined;
    }
  }

  if (!email && accessToken) {
    try {
      await accessTokenVerifier.verify(accessToken);
      email = await getEmailFromAccessToken(accessToken);
    } catch {
      email = undefined;
    }
  }

  if (!email) return null;

  const user = await getUserByEmail(email);
  if (!user) return null;

  const auth: AuthContext = {
    user_id: user.user_id,
    email: user.email,
    role: normalizeRole(user.role),
    banned: Boolean(user.banned),
  };
  const resolved = { auth, user };
  AUTH_CACHE.set(event, resolved);

  return resolved;
}

export function isApiGatewayResponse(value: AuthContext | ApiGatewayResponse): value is ApiGatewayResponse {
  return "statusCode" in value;
}

export async function getUserByEmail(email: string): Promise<UserEntity | undefined> {
  const emailResult = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI.Email,
      KeyConditionExpression: "EMAIL_PK = :pk AND EMAIL_SK = :sk",
      ExpressionAttributeValues: {
        ":pk": emailPk(email),
        ":sk": emailGsiSk(EntityType.User),
      },
      Limit: 1,
    }),
  );

  return emailResult.Items?.[0] as UserEntity | undefined;
}

export async function getCurrentUser(event: ApiGatewayEvent): Promise<CurrentUserResult> {
  const resolved = await resolveAuth(event);
  if (!resolved) {
    return { ok: false, response: CommonErrors.unauthorized() };
  }

  return {
    ok: true,
    user: resolved.user,
    email: resolved.auth.email,
    auth: resolved.auth,
  };
}

export async function requireAuth(event: ApiGatewayEvent): Promise<AuthContext | ApiGatewayResponse> {
  const currentUser = await getCurrentUser(event);
  return currentUser.ok ? currentUser.auth : currentUser.response;
}

export async function getOptionalAuth(event: ApiGatewayEvent): Promise<AuthContext | null> {
  try {
    return (await resolveAuth(event))?.auth ?? null;
  } catch {
    return null;
  }
}

export async function requireRole(
  event: ApiGatewayEvent,
  roles: Role[],
): Promise<AuthContext | ApiGatewayResponse> {
  const auth = await requireAuth(event);
  if (isApiGatewayResponse(auth)) return auth;

  if (!roles.includes(auth.role)) {
    return CommonErrors.forbidden("Insufficient permissions");
  }

  return auth;
}

export function requireNotBanned(auth: AuthContext): ApiGatewayResponse | null {
  return auth.banned ? CommonErrors.forbidden("This account is banned") : null;
}
