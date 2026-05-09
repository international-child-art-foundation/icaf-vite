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

const DEFAULT_LIMIT = 20;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const qp = event.queryStringParameters ?? {};
    const limit = Math.min(
      Math.max(parseInt(String(qp.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 1),
      100,
    );
    const lastKey = qp.last_key
      ? JSON.parse(Buffer.from(qp.last_key, "base64").toString("utf-8"))
      : undefined;

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
      theme_family: item.theme_family as string | undefined,
      theme_instance: item.theme_instance as string | undefined,
      group_type: item.group_type as GroupListItem["group_type"],
      title: item.title as string,
      class_name: item.class_name as string | undefined,
      teacher_display_name: item.teacher_display_name as string | undefined,
      country: item.country as string,
      region: item.region as string | undefined,
      cover_art_ids: (item.cover_art_ids as string[]) ?? [],
      member_count: ((item.member_art_ids as string[]) ?? []).length,
      status: item.status as GroupListItem["status"],
      timestamp: item.timestamp as number,
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
