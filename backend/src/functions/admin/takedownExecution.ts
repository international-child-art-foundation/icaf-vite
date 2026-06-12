import { CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import {
  GetObjectTaggingCommand,
  ListObjectsV2Command,
  PutObjectTaggingCommand,
  type Tag,
} from "@aws-sdk/client-s3";
import { GetCommand, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import {
  ArtworkEntity,
  ApiGatewayResponse,
  CommonErrors,
  GroupEntity,
  TakedownRequestEntity,
} from "@icaf/shared";
import {
  ARTWORK_CLOUDFRONT_DISTRIBUTION_ID,
  cloudFrontClient,
  dynamodb,
  S3_BUCKET_NAME,
  s3Client,
  TABLE_NAME,
} from "../../config/aws-clients";
import { ARTWORK_GSI_ATTRS_TO_REMOVE } from "../../dynamo/artGsis";
import { GROUP_GSI_ATTRS_TO_REMOVE } from "../../dynamo/groupGsis";
import { EntityType } from "../../dynamo/ddbSchemaConsts";
import { reviewGsiSk, reviewPk } from "../../dynamo/reviewGsi";
import { Status } from "../../dynamo/shared";

type ExecuteTakedownResult =
  | {
      ok: true;
      affectedArtIds: string[];
      affectedGroupIds: string[];
      taggedObjectCount: number;
      status: "executed";
    }
  | { ok: false; response: ApiGatewayResponse };

type ArtTarget = {
  artId: string;
  art: ArtworkEntity;
};

type GroupTarget = {
  groupId: string;
  group: GroupEntity;
};

async function getTakedownRequest(tdrSk: string): Promise<TakedownRequestEntity | undefined> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: "TDR", SK: tdrSk },
    }),
  );

  return result.Item as TakedownRequestEntity | undefined;
}

async function getArtwork(artId: string): Promise<ArtworkEntity | undefined> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ART#${artId}`, SK: "-" },
    }),
  );

  return result.Item as ArtworkEntity | undefined;
}

async function getGroup(groupId: string): Promise<GroupEntity | undefined> {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `GROUP#${groupId}`, SK: "-" },
    }),
  );

  return result.Item as GroupEntity | undefined;
}

async function listArtworkObjectKeys(artId: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: `${artId}/`,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of result.Contents ?? []) {
      if (object.Key) keys.push(object.Key);
    }

    continuationToken = result.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

function mergeTakedownTags(existingTags: Tag[], tdrId: string): Tag[] {
  const retainedTags = existingTags.filter(
    (tag) => tag.Key !== "takedown" && tag.Key !== "tdr_id",
  );

  return [
    ...retainedTags.slice(0, 8),
    { Key: "takedown", Value: "true" },
    { Key: "tdr_id", Value: tdrId },
  ];
}

async function tagObjectForTakedown(key: string, tdrId: string): Promise<void> {
  const existing = await s3Client.send(
    new GetObjectTaggingCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    }),
  );

  await s3Client.send(
    new PutObjectTaggingCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Tagging: {
        TagSet: mergeTakedownTags(existing.TagSet ?? [], tdrId),
      },
    }),
  );
}

async function tagArtworksForTakedown(artIds: string[], tdrId: string): Promise<number> {
  let taggedObjectCount = 0;

  for (const artId of artIds) {
    const keys = await listArtworkObjectKeys(artId);
    for (const key of keys) {
      await tagObjectForTakedown(key, tdrId);
      taggedObjectCount++;
    }
  }

  return taggedObjectCount;
}

async function invalidateArtworkCloudFrontPaths(artIds: string[], tdrId: string): Promise<void> {
  if (artIds.length === 0) return;

  if (!ARTWORK_CLOUDFRONT_DISTRIBUTION_ID) {
    throw new Error("ARTWORK_CLOUDFRONT_DISTRIBUTION_ID is not configured");
  }

  await cloudFrontClient.send(
    new CreateInvalidationCommand({
      DistributionId: ARTWORK_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `tdr-${tdrId}-${Date.now()}`,
        Paths: {
          Quantity: artIds.length,
          Items: artIds.map((artId) => `/${artId}/*`),
        },
      },
    }),
  );
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export async function executeTakedownRequest(args: {
  tdrSk: string;
  adminId: string;
  reviewNotes?: string;
}): Promise<ExecuteTakedownResult> {
  const tdr = await getTakedownRequest(args.tdrSk);
  if (!tdr) {
    return { ok: false, response: CommonErrors.notFound("Takedown request not found") };
  }

  if (tdr.status === "executed") {
    return { ok: false, response: CommonErrors.badRequest("Takedown request is already executed") };
  }

  if (tdr.status === "canceled") {
    return { ok: false, response: CommonErrors.badRequest("Canceled takedown requests cannot be executed") };
  }

  const groupTargets: GroupTarget[] = [];
  if (tdr.group_id) {
    const group = await getGroup(tdr.group_id);
    if (!group) {
      return { ok: false, response: CommonErrors.notFound("Target group not found") };
    }
    groupTargets.push({ groupId: tdr.group_id, group });
  }

  const affectedArtIds = uniqueValues([
    tdr.art_id,
    ...groupTargets.flatMap((target) => target.group.member_art_ids ?? []),
  ]);

  const artTargets: ArtTarget[] = [];
  for (const artId of affectedArtIds) {
    const art = await getArtwork(artId);
    if (!art) {
      return { ok: false, response: CommonErrors.notFound(`Target artwork not found: ${artId}`) };
    }
    artTargets.push({ artId, art });
  }

  if (artTargets.length === 0 && groupTargets.length === 0) {
    return { ok: false, response: CommonErrors.badRequest("Takedown request has no target artwork or group") };
  }

  const taggedObjectCount = await tagArtworksForTakedown(affectedArtIds, tdr.tdr_id);
  await invalidateArtworkCloudFrontPaths(affectedArtIds, tdr.tdr_id);
  const nowMs = Date.now();
  const nowSeconds = Math.floor(nowMs / 1000);
  const reviewNotes = args.reviewNotes?.trim();
  const targetUserIds = uniqueValues([
    ...artTargets.map((target) => target.art.user_id),
    ...groupTargets.map((target) => target.group.user_id),
  ]);

  await dynamodb.send(
    new TransactWriteCommand({
      TransactItems: [
        ...artTargets.map(({ artId }) => ({
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `ART#${artId}`, SK: "-" },
            UpdateExpression: `SET #status = :hidden, REV_PK = :artRevPk, REV_SK = :artRevSk${reviewNotes ? ", takedown_review_notes = :notes" : ""} REMOVE ${ARTWORK_GSI_ATTRS_TO_REMOVE.join(", ")}`,
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":hidden": Status.Hidden,
              ":artRevPk": reviewPk(),
              ":artRevSk": reviewGsiSk(Status.Hidden, EntityType.Art, nowMs, artId),
              ...(reviewNotes ? { ":notes": reviewNotes } : {}),
            },
            ConditionExpression: "attribute_exists(PK)",
          },
        })),
        ...groupTargets.map(({ groupId }) => ({
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: `GROUP#${groupId}`, SK: "-" },
            UpdateExpression: `SET #status = :hidden, REV_PK = :groupRevPk, REV_SK = :groupRevSk${reviewNotes ? ", takedown_review_notes = :notes" : ""} REMOVE ${GROUP_GSI_ATTRS_TO_REMOVE.join(", ")}`,
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":hidden": Status.Hidden,
              ":groupRevPk": reviewPk(),
              ":groupRevSk": reviewGsiSk(Status.Hidden, EntityType.Group, nowMs, groupId),
              ...(reviewNotes ? { ":notes": reviewNotes } : {}),
            },
            ConditionExpression: "attribute_exists(PK)",
          },
        })),
        {
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: "TDR", SK: args.tdrSk },
            UpdateExpression:
              "SET #status = :executed, reviewed_by = :reviewer, reviewed_at = :reviewedAt, executed_at = :reviewedAt" +
              (reviewNotes ? ", review_notes = :notes" : ""),
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":executed": "executed",
              ":requesting": "requesting",
              ":disputing": "disputing",
              ":reviewer": args.adminId,
              ":reviewedAt": nowSeconds,
              ...(reviewNotes ? { ":notes": reviewNotes } : {}),
            },
            ConditionExpression: "attribute_exists(PK) AND #status IN (:requesting, :disputing)",
          },
        },
        ...targetUserIds.map((userId) => ({
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${userId}`,
              SK: `AA#${nowSeconds}#TDR#${tdr.tdr_id}`,
              user_id: userId,
              ts: nowSeconds,
              initiator_id: args.adminId,
              action: "execute_takedown",
              tdr_id: tdr.tdr_id,
              ...(tdr.art_id ? { art_id: tdr.art_id } : {}),
              ...(tdr.group_id ? { group_id: tdr.group_id } : {}),
              ...(reviewNotes ? { reason: reviewNotes } : {}),
              type: "ACCOUNT_ACTION",
            },
            ConditionExpression: "attribute_not_exists(PK)",
          },
        })),
      ],
    }),
  );

  return {
    ok: true,
    affectedArtIds,
    affectedGroupIds: groupTargets.map((target) => target.groupId),
    taggedObjectCount,
    status: "executed",
  };
}
