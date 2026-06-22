import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import {
  DeleteCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { SQSEvent } from "aws-lambda";
import { isValidUUID, type UserEntity } from "@icaf/shared";
import {
  cognitoClient,
  dynamodb,
  s3Client,
  S3_BUCKET_NAME,
  TABLE_NAME,
  USER_POOL_ID,
} from "../config/aws-clients";
import { GSI } from "../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../dynamo/ownerGsi";

type DeleteAccountMessage = {
  action?: unknown;
  user_id?: unknown;
};

async function deleteArtworkObjects(artId: string): Promise<void> {
  let continuationToken: string | undefined;

  do {
    const listed = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: `${artId}/`,
        ContinuationToken: continuationToken,
      }),
    );
    const objects = (listed.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key));

    if (objects.length > 0) {
      const deleted = await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET_NAME,
          Delete: { Objects: objects.map((Key) => ({ Key })) },
        }),
      );
      if (deleted.Errors?.length) {
        throw new Error(
          `S3 failed to delete ${deleted.Errors.length} object(s) for artwork ${artId}`,
        );
      }
    }

    continuationToken = listed.NextContinuationToken;
  } while (continuationToken);
}

async function deleteOwnedContent(userId: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;

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
        await dynamodb.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `ART#${item.art_id}`, SK: "-" },
          }),
        );
      } else if (item.type === "GROUP" && typeof item.group_id === "string") {
        await dynamodb.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `GROUP#${item.group_id}`, SK: "-" },
          }),
        );
      }
    }

    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

async function deleteUserItemsExceptProfile(userId: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `USER#${userId}` },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    for (const item of result.Items ?? []) {
      if (item.SK === "PROFILE") continue;
      await dynamodb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
        }),
      );
    }

    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

async function anonymizeTakedownRequests(email: string): Promise<void> {
  let lastKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "PK = :tdrPk AND requester_email = :email",
        ExpressionAttributeValues: { ":tdrPk": "TDR", ":email": email },
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    for (const item of result.Items ?? []) {
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: "SET requester_email = :removed, requester_name = :removed",
          ExpressionAttributeValues: { ":removed": "[removed]" },
        }),
      );
    }

    lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);
}

async function deleteAccount(userId: string): Promise<void> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      ConsistentRead: true,
    }),
  );
  const user = result.Item as UserEntity | undefined;
  if (!user) return;
  if (user.deletion_pending !== true) {
    throw new Error(`Account deletion was not requested for user ${userId}`);
  }

  await deleteOwnedContent(userId);
  await deleteUserItemsExceptProfile(userId);
  await anonymizeTakedownRequests(user.email);

  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: user.email,
      }),
    );
  } catch (error: unknown) {
    if ((error as { name?: string }).name !== "UserNotFoundException") throw error;
  }

  await dynamodb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `USER#${userId}`, SK: "PROFILE" },
      ConditionExpression: "deletion_pending = :pending",
      ExpressionAttributeValues: { ":pending": true },
    }),
  );
}

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body) as DeleteAccountMessage;
    if (
      message.action !== "delete_account" ||
      typeof message.user_id !== "string" ||
      !isValidUUID(message.user_id)
    ) {
      console.warn("Ignoring invalid account deletion message", {
        message_id: record.messageId,
      });
      continue;
    }

    await deleteAccount(message.user_id);
  }
};
