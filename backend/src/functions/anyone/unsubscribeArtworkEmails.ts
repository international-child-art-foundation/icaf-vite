import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  ApiGatewayResponse,
  COMMON_HEADERS,
  HTTP_STATUS,
} from "@icaf/shared";
import { APP_URL, dynamodb, TABLE_NAME } from "../../config/aws-clients";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
  try {
    const userId = event.queryStringParameters?.u?.trim();
    const token = event.queryStringParameters?.t?.trim();

    if (!userId || !UUID_PATTERN.test(userId) || !token) {
      return htmlResponse(
        HTTP_STATUS.BAD_REQUEST,
        "We could not unsubscribe you",
        "This unsubscribe link is missing required information. Please contact us so we can help update your email preferences.",
      );
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${userId}`, SK: "PROFILE" },
        UpdateExpression: "SET artwork_emails_off = :off, artwork_email_unsub_at = :unsubAt",
        ConditionExpression: "attribute_exists(PK) AND unsub_token = :token",
        ExpressionAttributeValues: {
          ":off": true,
          ":unsubAt": nowSeconds,
          ":token": token,
        },
      }),
    );

    return htmlResponse(
      HTTP_STATUS.OK,
      "You have been unsubscribed",
      "You have been unsubscribed from all notification emails.",
    );
  } catch (error: unknown) {
    const ddbErr = error as { name?: string };
    if (ddbErr.name === "ConditionalCheckFailedException") {
      return htmlResponse(
        HTTP_STATUS.BAD_REQUEST,
        "We could not unsubscribe you",
        "This unsubscribe link is invalid. Please contact us so we can help update your email preferences.",
      );
    }

    console.error("Error unsubscribing from artwork emails:", error);
    return htmlResponse(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "We could not unsubscribe you",
      "We could not update your email preferences. Please contact us so we can help.",
    );
  }
};

function htmlResponse(statusCode: number, title: string, message: string): ApiGatewayResponse {
  return {
    statusCode,
    body: [
      "<!doctype html>",
      "<html lang=\"en\">",
      "<head>",
      "<meta charset=\"utf-8\">",
      "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
      `<title>${escapeHtml(title)}</title>`,
      "</head>",
      "<body style=\"font-family:Arial,sans-serif;line-height:1.5;color:#202020;margin:40px;max-width:680px;\">",
      `<h1>${escapeHtml(title)}</h1>`,
      `<p>${escapeHtml(message)}</p>`,
      `<p><a href="${escapeHtml(APP_URL)}" style="color:#0f5c8a;">Return to the ICAF homepage</a></p>`,
      "</body>",
      "</html>",
    ].join(""),
    headers: {
      ...COMMON_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
