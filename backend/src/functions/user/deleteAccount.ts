import { AdminDeleteUserCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  cognitoClient,
  dynamodb,
  s3Client,
  TABLE_NAME,
  USER_POOL_ID,
  USER_POOL_CLIENT_ID,
  S3_BUCKET_NAME,
} from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserEntity,
  DeleteAccountRequest,
} from "@icaf/shared";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "DELETE") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const body: DeleteAccountRequest = JSON.parse(event.body ?? "{}");
    if (!body.password) {
      return CommonErrors.badRequest("password is required");
    }

    // ── Read USER entity to get email for password verification ───────────
    const userResult = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "PROFILE",
        },
        Limit: 1,
      }),
    );

    if (!userResult.Items?.length) {
      return CommonErrors.notFound("User not found");
    }

    const user = userResult.Items[0] as UserEntity;

    // ── Verify password via Cognito ────────────────────────────────────────
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
    } catch (err: unknown) {
      const cognitoErr = err as { name?: string };
      if (
        cognitoErr.name === "NotAuthorizedException" ||
        cognitoErr.name === "UserNotFoundException"
      ) {
        return CommonErrors.unauthorized();
      }
      throw err;
    }

    // ── Step 1: Find all ART and GROUP entities owned by user ─────────────
    const artIds: string[] = [];
    const ownedKeys: { pk: string; sk: string }[] = [];
    let ownerLastKey: Record<string, unknown> | undefined;

    do {
      const ownerResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: GSI.ByOwner,
          KeyConditionExpression: "OWN_PK = :pk",
          ExpressionAttributeValues: { ":pk": byOwnerPk(userId) },
          ...(ownerLastKey && { ExclusiveStartKey: ownerLastKey }),
        }),
      );

      for (const item of ownerResult.Items ?? []) {
        const type = item.type as string;
        if (type === "ART") {
          const artId = item.art_id as string;
          artIds.push(artId);
          ownedKeys.push({ pk: `ART#${artId}`, sk: "-" });
        } else if (type === "GROUP") {
          ownedKeys.push({ pk: `GROUP#${item.group_id}`, sk: "-" });
        }
      }

      ownerLastKey = ownerResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (ownerLastKey);

    // ── Step 2: Delete ART and GROUP entities from DynamoDB ───────────────
    for (const { pk, sk } of ownedKeys) {
      await dynamodb.send(
        new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }),
      );
    }

    // ── Step 3: Delete S3 objects for each artwork (<art_id>/ prefix) ─────
    for (const artId of artIds) {
      try {
        const listed = await s3Client.send(
          new ListObjectsV2Command({ Bucket: S3_BUCKET_NAME, Prefix: `${artId}/` }),
        );
        const objects = listed.Contents ?? [];
        if (objects.length > 0) {
          await s3Client.send(
            new DeleteObjectsCommand({
              Bucket: S3_BUCKET_NAME,
              Delete: { Objects: objects.map((o) => ({ Key: o.Key! })) },
            }),
          );
        }
      } catch (s3Err) {
        // Non-fatal: log and continue — DDB record is already gone
        console.error(`S3 cleanup failed for art ${artId}:`, s3Err);
      }
    }

    // ── Step 4: Delete Cognito entry ──────────────────────────────────────
    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: userId,
      }),
    );

    // ── Step 5: Delete all USER#<userId> items (PROFILE, PAYMENT#*, AA#*) ─
    let userLastKey: Record<string, unknown> | undefined;
    const userKeysToDelete: { PK: string; SK: string }[] = [];

    do {
      const userItemsResult = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": `USER#${userId}` },
          ...(userLastKey && { ExclusiveStartKey: userLastKey }),
        }),
      );

      for (const item of userItemsResult.Items ?? []) {
        userKeysToDelete.push({ PK: item.PK as string, SK: item.SK as string });
      }

      userLastKey = userItemsResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (userLastKey);

    for (const key of userKeysToDelete) {
      await dynamodb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: key }));
    }

    // ── Step 6: Anonymize TDR entities with matching requester_email ───────
    let tdrLastKey: Record<string, unknown> | undefined;

    do {
      const scanResult = await dynamodb.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: "PK = :tdrPk AND requester_email = :email",
          ExpressionAttributeValues: {
            ":tdrPk": "TDR",
            ":email": user.email,
          },
          ...(tdrLastKey && { ExclusiveStartKey: tdrLastKey }),
        }),
      );

      for (const item of scanResult.Items ?? []) {
        await dynamodb.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK },
            UpdateExpression:
              "SET requester_email = :anon, requester_name = :anon",
            ExpressionAttributeValues: { ":anon": "[removed]" },
          }),
        );
      }

      tdrLastKey = scanResult.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (tdrLastKey);

    return {
      statusCode: HTTP_STATUS.NO_CONTENT,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error deleting account:", error);
    return CommonErrors.internalServerError();
  }
};
