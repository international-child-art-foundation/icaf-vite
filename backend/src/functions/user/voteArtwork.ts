import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const userId = event.requestContext?.authorizer?.claims?.sub;
    if (!userId) {
      return CommonErrors.unauthorized();
    }

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // Access pattern: Give kudos
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
        UpdateExpression: "ADD kudos_count :one",
        ExpressionAttributeValues: { ":one": 10 },
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ success: true, art_id: artId }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error giving kudos:", error);
    return CommonErrors.internalServerError();
  }
};
