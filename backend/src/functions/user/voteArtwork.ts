import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
} from "@icaf/shared";

const KUDOS_INCREMENT = 10;
const MAX_KUDOS = 10_000_000;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const artId = event.pathParameters?.art_id;

    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    const key = { PK: `ART#${artId}`, SK: "-" };
    const result = await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: "ADD kudos_count :increment",
        ConditionExpression:
          "attribute_exists(PK) AND #status = :approved AND (attribute_not_exists(kudos_count) OR kudos_count <= :maxBeforeIncrement)",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":increment": KUDOS_INCREMENT,
          ":approved": "approved",
          ":maxBeforeIncrement": MAX_KUDOS - KUDOS_INCREMENT,
        },
        ReturnValues: "UPDATED_NEW",
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({
        success: true,
        art_id: artId,
        kudos_count: result.Attributes?.kudos_count,
        capped: false,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "ConditionalCheckFailedException"
    ) {
      const artId = event.pathParameters?.art_id;

      if (!artId) {
        return CommonErrors.badRequest("art_id path parameter is required");
      }

      const key = { PK: `ART#${artId}`, SK: "-" };

      const existingArtwork = await dynamodb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: key,
          ProjectionExpression: "PK, kudos_count, #status",
          ExpressionAttributeNames: {
            "#status": "status",
          },
        }),
      );

      if (
        !existingArtwork.Item ||
        existingArtwork.Item.status !== "approved"
      ) {
        return CommonErrors.notFound("Artwork not found");
      }

      const currentKudos = existingArtwork.Item.kudos_count ?? 0;

      if (currentKudos >= MAX_KUDOS - KUDOS_INCREMENT) {
        return {
          statusCode: HTTP_STATUS.OK,
          body: JSON.stringify({
            success: true,
            art_id: artId,
            kudos_count: Math.min(currentKudos, MAX_KUDOS),
            capped: true,
          }),
          headers: COMMON_HEADERS,
        };
      }

      console.error("Unexpected kudos condition failure:", error);
      return CommonErrors.internalServerError();
    }

    console.error("Error giving kudos:", error);
    return CommonErrors.internalServerError();
  }
};
