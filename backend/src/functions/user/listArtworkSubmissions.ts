import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkListItem,
  ListArtworkSubmissionsResponse,
} from "@icaf/shared";
import { GSI } from "../../dynamo/ddbSchemaConsts";
import { byOwnerPk } from "../../dynamo/ownerGsi";
import { parseBase64JsonObject } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";

const DEFAULT_LIMIT = 20;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const userId = currentUser.user.user_id;

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1), 100);
    const parsedLastKey = qp.last_key
      ? parseBase64JsonObject(qp.last_key, "last_key is invalid")
      : undefined;
    if (parsedLastKey && !parsedLastKey.ok) {
      return parsedLastKey.response;
    }
    const lastKey = parsedLastKey?.value;

    // Query ByOwner GSI: OWNER#<user_id> + begins_with(OWN_SK, "TYPE#ART")
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI.ByOwner,
        KeyConditionExpression: "OWN_PK = :pk AND begins_with(OWN_SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": byOwnerPk(userId),
          ":skPrefix": "TYPE#ART",
        },
        Limit: limit + 1,
        ScanIndexForward: false, // newest first
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    const items = result.Items ?? [];
    const has_more = items.length > limit;
    const page = has_more ? items.slice(0, limit) : items;

    const artworks: ArtworkListItem[] = page.map((item) => ({
      art_id: item.art_id as string,
      f_name: item.f_name as string | undefined,
      age: item.age as number | undefined,
      country: item.country as string | undefined,
      region: item.region as string | undefined,
      title: item.title as string | undefined,
      description: item.description as string | undefined,
      l_name: item.l_name as string | undefined,
      theme: item.theme as string | undefined,
      group_id: item.group_id as string | undefined,
      status: item.status as ArtworkListItem["status"],
      kudos_count: (item.kudos_count as number) ?? 0,
      ts: item.ts as number,
      rev_num: (item.rev_num as number | undefined) ?? 1,
      promotional_use: (item.promotional_use as boolean | undefined) ?? false,
      notifications: item.notifications as boolean | undefined,
    }));

    const lastEvaluatedKey = has_more ? items[limit - 1] : result.LastEvaluatedKey;
    const response: ListArtworkSubmissionsResponse = {
      artworks,
      has_more,
      ...(lastEvaluatedKey && {
        last_key: Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64"),
      }),
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error listing artwork submissions:", error);
    return CommonErrors.internalServerError();
  }
};
