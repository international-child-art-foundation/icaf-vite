import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  DeleteAccountRequest,
} from "@icaf/shared";
import {
  CLEANUP_QUEUE_URL,
  cognitoClient,
  dynamodb,
  sqsClient,
  TABLE_NAME,
  USER_POOL_CLIENT_ID,
} from "../../config/aws-clients";
import { getCurrentUser } from "../../utils/auth";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const user = currentUser.user;

    const parsedBody = parseJsonBody<DeleteAccountRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;
    if (!body.password) {
      return CommonErrors.badRequest("password is required");
    }

    try {
      await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: USER_POOL_CLIENT_ID,
          AuthParameters: {
            USERNAME: user.email,
            PASSWORD: body.password,
          },
        }),
      );
    } catch (error: unknown) {
      const name = (error as { name?: string }).name;
      if (name === "NotAuthorizedException" || name === "UserNotFoundException") {
        return CommonErrors.unauthorized();
      }
      throw error;
    }

    const requestedAt = Math.floor(Date.now() / 1000);
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET deletion_pending = :pending, deletion_requested_at = if_not_exists(deletion_requested_at, :requestedAt)",
        ExpressionAttributeValues: {
          ":pending": true,
          ":requestedAt": requestedAt,
        },
        ConditionExpression: "attribute_exists(PK)",
      }),
    );

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: CLEANUP_QUEUE_URL,
        MessageBody: JSON.stringify({
          action: "delete_account",
          user_id: user.user_id,
        }),
      }),
    );

    return {
      statusCode: 202,
      body: "",
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error requesting account deletion:", error);
    return CommonErrors.internalServerError();
  }
};
