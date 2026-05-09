import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  cognitoClient,
  dynamodb,
  USER_POOL_ID,
  TABLE_NAME,
} from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  VerifyAccountRequest,
  UserEntity,
} from "@icaf/shared";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    if (event.httpMethod !== "POST") {
      return CommonErrors.methodNotAllowed();
    }

    const body: VerifyAccountRequest = JSON.parse(event.body ?? "{}");

    if (!body.user_id?.trim()) return CommonErrors.badRequest("user_id is required");
    if (!body.verify_token?.trim()) return CommonErrors.badRequest("verify_token is required");

    // 1. Read USER entity
    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${body.user_id}`, SK: "PROFILE" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("User not found");
    }

    const user = result.Item as UserEntity;

    // 2. Validate token
    if (user.verify_token !== body.verify_token) {
      return CommonErrors.badRequest("Invalid verification token");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (user.verify_token_expiration !== undefined && user.verify_token_expiration < nowSeconds) {
      return CommonErrors.badRequest("Verification token has expired");
    }

    // 3. If virtual user, create their Cognito account
    if (user.is_virtual) {
      if (!body.password) {
        return CommonErrors.badRequest("password is required to create your account");
      }

      // Create user in Cognito (suppress the invitation email — we already sent our own)
      await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          MessageAction: MessageActionType.SUPPRESS,
          UserAttributes: [
            { Name: "email", Value: user.email },
            { Name: "email_verified", Value: "true" },
            ...(user.f_name ? [{ Name: "given_name", Value: user.f_name }] : []),
            ...(user.l_name ? [{ Name: "family_name", Value: user.l_name }] : []),
            ...(user.dob ? [{ Name: "birthdate", Value: user.dob }] : []),
          ],
        }),
      );

      // Set permanent password (bypasses FORCE_CHANGE_PASSWORD)
      await cognitoClient.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          Password: body.password,
          Permanent: true,
        }),
      );
    }

    // 4. Write verified_at, clear token, mark no longer virtual
    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${body.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          "SET verified_at = :now, is_virtual = :false REMOVE verify_token, verify_token_expiration",
        ExpressionAttributeValues: {
          ":now": nowSeconds,
          ":false": false,
        },
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Account verified successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("VerifyAccount error:", error);
    if (error.name === "UsernameExistsException") {
      return CommonErrors.conflict("A Cognito account already exists for this email");
    }
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    return CommonErrors.internalServerError();
  }
};
