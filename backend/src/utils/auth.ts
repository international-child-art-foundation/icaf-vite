import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  CommonErrors,
  UserEntity,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../config/aws-clients";
import { EntityType, GSI } from "../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../dynamo/emailGsi";

export type CurrentUserResult =
  | { ok: true; user: UserEntity; email: string }
  | { ok: false; response: ApiGatewayResponse };

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
  const claims = event.requestContext?.authorizer?.claims;
  const email = claims?.email?.trim();

  if (!email) {
    return { ok: false, response: CommonErrors.unauthorized() };
  }

  const userByEmail = await getUserByEmail(email);

  if (userByEmail) {
    return {
      ok: true,
      user: userByEmail,
      email,
    };
  }

  return { ok: false, response: CommonErrors.notFound("User profile not found") };
}
