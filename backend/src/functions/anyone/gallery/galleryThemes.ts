import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  ListThemesResponse,
  parseThemeSK,
  ThemeListItem,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../../config/aws-clients";
import { EntityType } from "../../../dynamo/ddbSchemaConsts";

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : undefined;
}

function mapTheme(item: Record<string, unknown>): ThemeListItem {
  const parsed = parseThemeSK(item.SK as string);
  return {
    theme_sk: item.SK as string,
    theme_family: item.theme_family as string,
    ...(parsed?.kind === "instance" && {
      instance_type: parsed.instance_type,
      theme_instance: parsed.theme_instance,
    }),
    description: item.description as string | undefined,
    featured_on: stringArray(item.featured_on) ?? [],
    start_date: typeof item.start_date === "number" ? item.start_date : 0,
    retired_at: typeof item.retired_at === "number" ? item.retired_at : undefined,
  };
}

export const handler = async (
  _event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const items: Record<string, unknown>[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "#pk = :pk",
          ExpressionAttributeNames: {
            "#pk": "PK",
          },
          ExpressionAttributeValues: {
            ":pk": EntityType.Theme,
          },
          ExclusiveStartKey: lastKey,
          ScanIndexForward: true,
        }),
      );

      items.push(...((result.Items ?? []) as Record<string, unknown>[]));
      lastKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (lastKey);

    const themes = items.map(mapTheme);
    const response: ListThemesResponse = {
      themes,
      count: themes.length,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error querying gallery featured themes:", error);
    return CommonErrors.internalServerError();
  }
};
