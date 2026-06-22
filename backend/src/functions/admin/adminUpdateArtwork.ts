import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  FORBIDDEN_CHARS_MULTILINE,
  FORBIDDEN_CHARS_SINGLELINE,
  MAX_DESCRIPTION_LEN,
  MAX_STRING_LEN,
  MAX_TITLE_LEN,
  SubmitterRelationship,
  isValidThemeSk,
} from "@icaf/shared";
import { buildApprovedArtworkGsiAttrs } from "../../dynamo/artGsis";
import { parseJsonBody } from "../../utils/request";
import { getCurrentUser } from "../../utils/auth";
import { hasMinimumRole } from "@icaf/shared";

const ALLOWED_UPDATE_FIELDS = new Set([
  "title",
  "description",
  "f_name",
  "l_name",
  "age",
  "country",
  "region",
  "submitter_relationship",
  "theme",
  "notifications",
]);
const RELATIONSHIPS: SubmitterRelationship[] = [
  "legal_guardian",
  "adult_facilitator",
];
type AdminArtworkUpdateRequest = Record<string, unknown>;

function isRemoval(value: unknown) {
  return value === null || value === "";
}

function validateStringField(
  field: string,
  value: unknown,
  maxLength: number,
  multiline = false,
): string | undefined {
  if (isRemoval(value)) return undefined;
  if (typeof value !== "string") return `${field} must be a string`;
  if (value.length > maxLength) return `${field} must be ${maxLength} characters or less`;
  const forbiddenChars = multiline ? FORBIDDEN_CHARS_MULTILINE : FORBIDDEN_CHARS_SINGLELINE;
  if (forbiddenChars.test(value)) return `${field} contains invalid characters`;
  return undefined;
}

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    if (!hasMinimumRole(currentUser.user.role, "admin")) {
        return CommonErrors.forbidden("Admin access required");
    }

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // ── Read ART entity to verify ownership ───────────────────────────────
    const artResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    if (!artResult.Item) {
      return CommonErrors.notFound("Artwork not found");
    }

    const art = artResult.Item as ArtworkEntity;

    const parsedBody = parseJsonBody<AdminArtworkUpdateRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const unknownFields = Object.keys(parsedBody.value).filter((key) => !ALLOWED_UPDATE_FIELDS.has(key));
    if (unknownFields.length > 0) {
      return CommonErrors.badRequest(`Unsupported field(s): ${unknownFields.join(", ")}`);
    }
    const STRING_FIELDS: Array<[field: string, maxLength: number, multiline: boolean]> = [
      ["title", MAX_TITLE_LEN, false],
      ["description", MAX_DESCRIPTION_LEN, true],
      ["f_name", MAX_STRING_LEN, false],
      ["l_name", MAX_STRING_LEN, false],
      ["country", MAX_STRING_LEN, false],
      ["region", MAX_STRING_LEN, false],
      ["theme", MAX_STRING_LEN, false],
    ];

    const body = parsedBody.value;
    const fieldErrors = [
      ...STRING_FIELDS.map(([field, maxLength, multiline]) =>
        field in body
          ? validateStringField(field, body[field], maxLength, multiline)
          : undefined,
      ),
      "age" in body && !isRemoval(body.age) && (!Number.isInteger(body.age) || (body.age as number) < 1 || (body.age as number) > 150)
        ? "age, if provided, must be an integer between 1 and 150"
        : undefined,
      "submitter_relationship" in body &&
        !isRemoval(body.submitter_relationship) &&
        !RELATIONSHIPS.includes(body.submitter_relationship as SubmitterRelationship)
        ? `submitter_relationship must be one of: ${RELATIONSHIPS.join(", ")}`
        : undefined,
      "theme" in body &&
        !isRemoval(body.theme) &&
        (typeof body.theme !== "string" || !isValidThemeSk(body.theme))
        ? "theme must be a valid theme SK"
        : undefined,
      "notifications" in body &&
        !isRemoval(body.notifications) &&
        typeof body.notifications !== "boolean"
        ? "notifications, if provided, must be a boolean"
        : undefined,
    ].filter(Boolean) as string[];    if (fieldErrors.length > 0) {
      return CommonErrors.badRequest(fieldErrors.join("; "));
    }
    if (Object.keys(body).length === 0) {
      return CommonErrors.badRequest("at least one field must be provided");
    }

    // ── Build update expression ────────────────────────────────────────────
    const setExprParts: string[] = [];
    const removeExprParts: string[] = [];
    const exprNames: Record<string, string> = {};
    const exprValues: Record<string, unknown> = {};

    setExprParts.push("rev_num = if_not_exists(rev_num, :one) + :one");
    exprValues[":one"] = 1;

    function setOrRemove(field: string, placeholder: string, value: unknown, namePlaceholder?: string) {
      if (isRemoval(value)) {
        removeExprParts.push(namePlaceholder ?? field);
        if (namePlaceholder) exprNames[namePlaceholder] = field;
        return;
      }
      setExprParts.push(`${namePlaceholder ?? field} = ${placeholder}`);
      if (namePlaceholder) exprNames[namePlaceholder] = field;
      exprValues[placeholder] = value;
    }

    if ("title" in body) setOrRemove("title", ":title", body.title);
    if ("description" in body) setOrRemove("description", ":desc", body.description);
    if ("f_name" in body) setOrRemove("f_name", ":f_name", body.f_name);
    if ("l_name" in body) setOrRemove("l_name", ":l_name", body.l_name);
    if ("age" in body) setOrRemove("age", ":age", body.age);
    if ("country" in body) setOrRemove("country", ":country", body.country);
    if ("region" in body) setOrRemove("region", ":region", body.region, "#region");
    if ("submitter_relationship" in body) setOrRemove("submitter_relationship", ":rel", body.submitter_relationship);
    if ("theme" in body) setOrRemove("theme", ":theme", body.theme);
    if (art.group_id) {
      setExprParts.push("notifications = :notifications");
      exprValues[":notifications"] = false;
    } else if ("notifications" in body) {
      if (isRemoval(body.notifications)) {
        removeExprParts.push("notifications");
      } else {
        setExprParts.push("notifications = :notifications");
        exprValues[":notifications"] = body.notifications;
      }
    }
    if (art.status === "approved") {
      const nextTheme =
        "theme" in body
          ? isRemoval(body.theme)
            ? undefined
            : body.theme as string
          : art.theme;
      const gsiAttrs = buildApprovedArtworkGsiAttrs({
        tsMs: art.ts * 1000,
        artId,
        theme: nextTheme,
      });

      Object.entries(gsiAttrs).forEach(([key, value], index) => {
        setExprParts.push(`${key} = :gsi${index}`);
        exprValues[`:gsi${index}`] = value;
      });

      if (!gsiAttrs.FAM_PK) {
        removeExprParts.push("FAM_PK");
      }
      if (!gsiAttrs.INST_PK) {
        removeExprParts.push("INST_PK");
      }
    }

    if (setExprParts.length === 0 && removeExprParts.length === 0) {
      return CommonErrors.badRequest("at least one field must be provided");
    }

    const updateExpression = [
      setExprParts.length > 0 ? `SET ${setExprParts.join(", ")}` : "",
      removeExprParts.length > 0 ? `REMOVE ${removeExprParts.join(", ")}` : "",
    ].filter(Boolean).join(" ");

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
        UpdateExpression: updateExpression,
        ...(Object.keys(exprNames).length > 0 && { ExpressionAttributeNames: exprNames }),
        ...(Object.keys(exprValues).length > 0 && { ExpressionAttributeValues: exprValues }),
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, art_id: artId, status: art.status }),
      headers: COMMON_HEADERS,
    };
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return CommonErrors.notFound("Artwork not found");
    }
    console.error("Error updating artwork:", error);
    return CommonErrors.internalServerError();
  }
};
