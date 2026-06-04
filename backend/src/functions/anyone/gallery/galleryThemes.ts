import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  HTTP_STATUS,
  ListThemesResponse,
  ThemeColors,
  ThemeListItem,
} from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../../config/aws-clients";
import { EntityType } from "../../../dynamo/ddbSchemaConsts";

const GALLERY_FEATURE = "gallery";

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : undefined;
}

function themeColors(value: unknown): ThemeColors | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as ThemeColors)
    : undefined;
}

function mapTheme(item: Record<string, unknown>): ThemeListItem {
  return {
    theme_family: item.theme_family as string,
    theme_instance: item.theme_instance as string,
    display_name: item.display_name as string,
    description: item.description as string | undefined,
    featured_on: stringArray(item.featured_on)!,
    colors: themeColors(item.colors),
    f_img_url: item.f_img_url as string | undefined,
    i_img_url: item.i_img_url as string | undefined,
    style: item.style as string | undefined,
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
          FilterExpression: "contains(#featuredOn, :feature)",
          ExpressionAttributeNames: {
            "#pk": "PK",
            "#featuredOn": "featured_on",
          },
          ExpressionAttributeValues: {
            ":pk": EntityType.Theme,
            ":feature": GALLERY_FEATURE,
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
