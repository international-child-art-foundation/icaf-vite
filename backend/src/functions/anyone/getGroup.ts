import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  GroupEntity,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "GET") {
      return CommonErrors.methodNotAllowed();
    }

    const groupId = event.pathParameters?.group_id?.trim();
    if (!groupId) {
      return CommonErrors.badRequest("Group ID is required");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `GROUP#${groupId}`, SK: "-" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("Group not found");
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ group: result.Item as GroupEntity }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error getting group:", error);
    return CommonErrors.internalServerError();
  }
};
