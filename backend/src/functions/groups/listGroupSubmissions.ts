import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupListItem,
  ListGroupSubmissionsResponse,
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
    const limit = Math.min(
      Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      100,
    );
    const parsedLastKey = qp.last_key
      ? parseBase64JsonObject(qp.last_key, "last_key is invalid")
      : undefined;
    if (parsedLastKey && !parsedLastKey.ok) {
      return parsedLastKey.response;
    }
    const lastKey = parsedLastKey?.value;

    // Query ByOwner GSI: OWNER#<user_id> + begins_with(OWN_SK, "TYPE#GROUP")
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI.ByOwner,
        KeyConditionExpression: "OWN_PK = :pk AND begins_with(OWN_SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": byOwnerPk(userId),
          ":skPrefix": "TYPE#GROUP",
        },
        Limit: limit + 1,
        ScanIndexForward: false, // newest first
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );

    const items = result.Items ?? [];
    const has_more = items.length > limit;
    const page = has_more ? items.slice(0, limit) : items;

    const groups: GroupListItem[] = page.map((item) => ({
      group_id: item.group_id as string,
      theme: item.theme as string | undefined,
      group_type: item.group_type as GroupListItem["group_type"],
      title: item.title as string,
      class_name: item.class_name as string | undefined,
      submitter_display_name: item.submitter_display_name as string | undefined,
      country: item.country as string,
      region: item.region as string | undefined,
      preview_art_ids: ((item.member_art_ids as string[]) ?? []).slice(0, 4),
      member_count: ((item.member_art_ids as string[]) ?? []).length,
      status: item.status as GroupListItem["status"],
      ts: item.ts as number,
      rev_num: (item.rev_num as number | undefined) ?? 1,
      notifications: item.notifications as boolean | undefined,
    }));

    const lastEvaluatedKey = has_more ? items[limit - 1] : result.LastEvaluatedKey;
    const response: ListGroupSubmissionsResponse = {
      groups,
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
    console.error("Error listing group submissions:", error);
    return CommonErrors.internalServerError();
  }
};
