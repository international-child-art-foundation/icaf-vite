import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const artId = event.pathParameters?.art_id?.trim();
    if (!artId) {
      return CommonErrors.badRequest("Artwork ID is required");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `ART#${artId}`, SK: "-" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("Artwork not found");
    }

    const artwork = { ...(result.Item as ArtworkEntity) };
    delete artwork.digital_signature;
    delete (artwork as Record<string, unknown>).digital_signature_hash;

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ artwork }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error getting artwork:", error);
    return CommonErrors.internalServerError();
  }
};
