import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE_NAME, dynamodb } from "../../config/aws-clients";
import { ApiGatewayResponse, CommonErrors, ThemeEntity } from "@icaf/shared";

export async function ensureThemeEntity(args: {
  theme?: string;
  nowMs?: number;
}): Promise<{ ok: true } | { ok: false; response: ApiGatewayResponse }> {
  if (!args.theme) return { ok: true };

  const result = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: "THEME", SK: args.theme },
    }),
  );

  if (!result.Item) {
    return { ok: false, response: CommonErrors.badRequest("Selected theme does not exist") };
  }

  const theme = result.Item as ThemeEntity;
  const nowMs = args.nowMs ?? Date.now();
  if (typeof theme.retired_at === "number" && theme.retired_at <= nowMs) {
    return { ok: false, response: CommonErrors.badRequest("Selected theme is retired") };
  }

  return { ok: true };
}
