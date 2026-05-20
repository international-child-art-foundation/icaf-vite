import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_CLIENT_ID,
} from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  COMMON_HEADERS,
  CommonErrors,
  ConfirmDefaultRegistrationRequest,
  HTTP_STATUS,
  MAX_EMAIL_LEN,
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<ConfirmDefaultRegistrationRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    const email = body.email?.trim();
    const confirmationCode = body.confirmation_code?.trim();

    if (!email) return CommonErrors.badRequest("email is required");
    if (email.length > MAX_EMAIL_LEN) {
      return CommonErrors.badRequest(`email must be ${MAX_EMAIL_LEN} characters or less`);
    }
    if (!confirmationCode) {
      return CommonErrors.badRequest("confirmation_code is required");
    }

    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
      }),
    );

    const userResult = await dynamodb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: GSI.Email,
        KeyConditionExpression: "EMAIL_PK = :pk AND EMAIL_SK = :sk",
        ExpressionAttributeValues: {
          ":pk": emailPk(email),
          ":sk": emailGsiSk(EntityType.User),
        },
        Limit: 1,
      }),
    );

    const user = userResult.Items?.[0];
    if (user?.user_id) {
      await dynamodb.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: `USER#${user.user_id}`, SK: "PROFILE" },
          UpdateExpression: "SET verified_at = :now, is_virtual = :false, #role = if_not_exists(#role, :role)",
          ExpressionAttributeNames: { "#role": "role" },
          ExpressionAttributeValues: {
            ":now": Math.floor(Date.now() / 1000),
            ":false": false,
            ":role": "user",
          },
        }),
      );
    }

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Account verified successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("ConfirmDefaultRegistration error:", error);
    if (error.name === "CodeMismatchException") {
      return CommonErrors.badRequest("Invalid verification code");
    }
    if (error.name === "ExpiredCodeException") {
      return CommonErrors.badRequest("Verification code has expired");
    }
    if (error.name === "UserNotFoundException") {
      return CommonErrors.notFound("User not found");
    }
    if (error.name === "NotAuthorizedException") {
      return CommonErrors.badRequest("User is already confirmed");
    }
    if (error.name === "TooManyFailedAttemptsException") {
      return CommonErrors.tooManyRequests("Too many failed attempts. Please try again later.");
    }
    if (error.name === "LimitExceededException") {
      return CommonErrors.tooManyRequests("Too many requests. Please try again later.");
    }
    return CommonErrors.internalServerError();
  }
};
