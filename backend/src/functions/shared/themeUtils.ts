import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { buildThemeSK } from "@icaf/shared";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import { EntityType } from "../../dynamo/ddbSchemaConsts";

function themeDisplayName(family: string, instance: string): string {
  const familyName = family
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return familyName ? `${familyName} ${instance}` : instance;
}

function isConditionalCheckFailure(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ConditionalCheckFailedException"
  );
}

export async function ensureThemeEntity(args: {
  family?: string;
  instance?: string;
}): Promise<void> {
  const family = args.family?.trim();
  const instance = args.instance?.trim();

  if (!family || !instance) {
    return;
  }

  try {
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: EntityType.Theme,
          SK: buildThemeSK(family, instance),
          theme_family: family,
          theme_instance: instance,
          display_name: themeDisplayName(family, instance),
          type: EntityType.Theme,
        },
        ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)",
      }),
    );
  } catch (error) {
    if (isConditionalCheckFailure(error)) {
      return;
    }
    throw error;
  }
}
