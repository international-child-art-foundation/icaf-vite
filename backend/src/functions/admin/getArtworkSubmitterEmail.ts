import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  ArtworkEntity,
  UserEntity,
  GetArtworkSubmitterEmailResponse,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;

    const artId = event.pathParameters?.art_id;
    if (!artId) {
      return CommonErrors.badRequest("art_id path parameter is required");
    }

    // ── Read ART entity ────────────────────────────────────────────────────
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

    // ── Read USER entity for email ─────────────────────────────────────────
    const userResult = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${art.user_id}`, SK: "PROFILE" },
      }),
    );

    if (!userResult.Item) {
      return CommonErrors.notFound("Submitter user record not found");
    }

    const user = userResult.Item as UserEntity;

    const response: GetArtworkSubmitterEmailResponse = {
      art_id: artId,
      artwork_title: art.title ?? "",
      user_id: art.user_id,
      email: user.email,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error getting artwork submitter email:", error);
    return CommonErrors.internalServerError();
  }
};
