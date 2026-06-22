import { AdminDeleteUserCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DeleteCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  DeleteAccountRequest,
} from "@icaf/shared";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_CLIENT_ID,
  USER_POOL_ID,
} from "../../config/aws-clients";
import { getCurrentUser } from "../../utils/auth";
import { parseJsonBody } from "../../utils/request";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
import { deleteArtworkObjects, invalidateArtworkPaths } from "../shared/artworkObjects";

async function deleteOwnedContent(userId: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;
  const deletedArtIds: string[] = [];

  do {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI.ByOwner,
        KeyConditionExpression: "OWN_PK = :pk",
        ExpressionAttributeValues: { ":pk": byOwnerPk(userId) },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    for (const item of result.Items ?? []) {
      if (item.type === "ART" && typeof item.art_id === "string") {
        await deleteArtworkObjects(item.art_id);
        await dynamodb.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `ART#${item.art_id}`, SK: "-" },
        }));
        deletedArtIds.push(item.art_id);
      } else if (item.type === "GROUP" && typeof item.group_id === "string") {
        await dynamodb.send(new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: `GROUP#${item.group_id}`, SK: "-" },
        }));
      }
    }
    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  try {
    await invalidateArtworkPaths(deletedArtIds);
  } catch (error) {
    console.error("Account deletion CloudFront invalidation failed:", error);
  }
}

async function deleteUserItemsExceptProfile(userId: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;
  do {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `USER#${userId}` },
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));
    for (const item of result.Items ?? []) {
      if (item.SK === "PROFILE") continue;
      await dynamodb.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: item.PK, SK: item.SK },
      }));
    }
    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

async function anonymizeTakedownRequests(email: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;
  do {
    const result = await dynamodb.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "PK = :tdrPk AND requester_email = :email",
      ExpressionAttributeValues: { ":tdrPk": "TDR", ":email": email },
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));
    for (const item of result.Items ?? []) {
      await dynamodb.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: "SET requester_email = :removed, requester_name = :removed",
        ExpressionAttributeValues: { ":removed": "[removed]" },
      }));
    }
    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const user = currentUser.user;

    const parsedBody = parseJsonBody<DeleteAccountRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;
    if (!body.password) {
      return CommonErrors.badRequest("password is required");
    }

    try {
      await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: USER_POOL_CLIENT_ID,
          AuthParameters: {
            USERNAME: user.email,
            PASSWORD: body.password,
          },
        }),
      );
    } catch (error: unknown) {
      const name = (error as { name?: string }).name;
      if (name === "NotAuthorizedException" || name === "UserNotFoundException") {
        return CommonErrors.unauthorized();
      }
      throw error;
    }

    const requestedAt = Math.floor(Date.now() / 1000);

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET #role = :deleting, deletion_requested_at = if_not_exists(deletion_requested_at, :requestedAt)",
        ConditionExpression:
          "attribute_exists(PK) AND (attribute_not_exists(#role) OR #role <> :deleting)",
        ExpressionAttributeNames: {
          "#role": "role",
        },
        ExpressionAttributeValues: {
          ":deleting": "deleting",
          ":requestedAt": requestedAt,
        },
      }),
    );

    await deleteOwnedContent(user.user_id);
    await deleteUserItemsExceptProfile(user.user_id);
    await anonymizeTakedownRequests(user.email);

    try {
      await cognitoClient.send(new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
      }));
    } catch (error: unknown) {
      if ((error as { name?: string }).name !== "UserNotFoundException") throw error;
    }

    await dynamodb.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
      ConditionExpression: "attribute_exists(PK)",
    }));

    return {
      statusCode: 204,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    return CommonErrors.internalServerError(
      "Account deletion could not be completed. Please contact us for assistance.",
    );
  }
};
