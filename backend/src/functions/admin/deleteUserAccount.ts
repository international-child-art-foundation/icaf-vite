import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { QueryCommand, DeleteCommand, UpdateCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_ID,
} from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  DeleteUserAccountRequest,
  DeleteUserAccountResponse,
  hasMinimumRole,
} from "@icaf/shared";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
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
    
    const adminId = currentUser.user.user_id;

    const targetUserId = event.pathParameters?.user_id;
    if (!targetUserId) {
      return CommonErrors.badRequest("user_id path parameter is required");
    }

    const parsedBody = parseJsonBody<DeleteUserAccountRequest>(event);
    if (!parsedBody.ok) {
      return parsedBody.response;
    }

    const body = parsedBody.value;
    if (!body.reason?.trim()) {
      return CommonErrors.badRequest("reason is required");
    }

    // ── Read target USER entity (for TDR anonymization later) ─────────────
    const userResult = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: { ":pk": `USER#${targetUserId}`, ":sk": "PROFILE" },
        Limit: 1,
      }),
    );

    if (!userResult.Items?.length) {
      return CommonErrors.notFound("User not found");
    }

    const target = userResult.Items[0] as UserEntity;

    // ── Step 1: Find and delete ART + GROUP entities ───────────────────────
    const ownedItems: { pk: string; sk: string }[] = [];
    let ownerLastKey: Record<string, unknown> | undefined;

    do {
      const ownerResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: GSI.ByOwner,
          KeyConditionExpression: "OWN_PK = :pk",
          ExpressionAttributeValues: { ":pk": byOwnerPk(targetUserId) },
          ...(ownerLastKey && { ExclusiveStartKey: ownerLastKey }),
        }),
      );

      for (const item of ownerResult.Items ?? []) {
        const type = item.type as string;
        if (type === "ART") ownedItems.push({ pk: `ART#${item.art_id}`, sk: "-" });
        else if (type === "GROUP") ownedItems.push({ pk: `GROUP#${item.group_id}`, sk: "-" });
      }

      ownerLastKey = ownerResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (ownerLastKey);

    let artworksDeleted = 0;
    for (const { pk, sk } of ownedItems) {
      await dynamodb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }));
      artworksDeleted++;
    }

    // ── Step 2: Delete Cognito entry ──────────────────────────────────────
    let cognitoDeleted = false;
    try {
      await cognitoClient.send(
        new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: target.email }),
      );
      cognitoDeleted = true;
    } catch (err: unknown) {
      const cognitoErr = err as { name?: string };
      if (cognitoErr.name !== "UserNotFoundException") {
        console.error("Cognito delete failed (non-fatal):", err);
      }
    }

    // ── Step 3: Delete all USER#<id> items (PROFILE, PAYMENT#*, AA#*) ─────
    let userLastKey: Record<string, unknown> | undefined;
    let entriesDeleted = 0;

    do {
      const userItemsResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": `USER#${targetUserId}` },
          ...(userLastKey && { ExclusiveStartKey: userLastKey }),
        }),
      );

      for (const item of userItemsResult.Items ?? []) {
        await dynamodb.send(
          new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: item.PK, SK: item.SK } }),
        );
        entriesDeleted++;
      }

      userLastKey = userItemsResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (userLastKey);

    // ── Step 4: Anonymize TDR entities ────────────────────────────────────
    let tdrLastKey: Record<string, unknown> | undefined;

    do {
      const scanResult = await dynamodb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "PK = :tdrPk AND requester_email = :email",
          ExpressionAttributeValues: { ":tdrPk": "TDR", ":email": target.email },
          ...(tdrLastKey && { ExclusiveStartKey: tdrLastKey }),
        }),
      );

      for (const item of scanResult.Items ?? []) {
        await dynamodb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
            UpdateExpression: "SET requester_email = :anon, requester_name = :anon",
            ExpressionAttributeValues: { ":anon": "[removed]" },
          }),
        );
      }

      tdrLastKey = scanResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (tdrLastKey);

    // ── Step 5: Write ACCOUNT_ACTION audit record ─────────────────────────
    const nowSeconds = Math.floor(Date.now() / 1000);
    const actionId = randomUUID();

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${targetUserId}`,
          SK: `AA#${nowSeconds}`,
          user_id: targetUserId,
          ts: nowSeconds,
          initiator_id: adminId,
          action: "delete_account_admin",
          reason: body.reason.trim(),
          type: "ACCOUNT_ACTION",
        },
      }),
    );

    const response: DeleteUserAccountResponse = {
      message: "User account deleted successfully",
      user_id: targetUserId,
      artworks_deleted: artworksDeleted,
      entries_deleted: entriesDeleted,
      cognito_deleted: cognitoDeleted,
      admin_action_id: actionId,
      ts: nowSeconds,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return CommonErrors.internalServerError();
  }
};
