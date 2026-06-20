import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminDisableUserCommand,
  AdminSetUserPasswordCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";
import { DeleteCommand, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_ID,
} from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  DefaultRegistrationRequest,
  MAX_NAME_LEN,
  MAX_EMAIL_LEN,
  MAX_PASSWORD_LEN,
  normalizeEmail,
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { parseJsonBody } from "../../utils/request";
import { sendRegistrationVerificationEmail } from "../../utils/emails/registrationVerification";
import { ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS } from "../../utils/authActionToken";


export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<DefaultRegistrationRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.email?.trim()) return CommonErrors.badRequest("email is required");
    const email = normalizeEmail(body.email);
    if (email.length > MAX_EMAIL_LEN) return CommonErrors.badRequest(`email must be ${MAX_EMAIL_LEN} characters or less`);
    if (!body.password) return CommonErrors.badRequest("password is required");
    if (body.password.length > MAX_PASSWORD_LEN) return CommonErrors.badRequest(`password must be ${MAX_PASSWORD_LEN} characters or less`);
    if (!body.f_name?.trim()) return CommonErrors.badRequest("f_name is required");
    if (!body.l_name?.trim()) return CommonErrors.badRequest("l_name is required");
    if (!body.dob?.trim()) return CommonErrors.badRequest("dob is required");
    if (
      body.has_newsletter_subscription !== undefined &&
      typeof body.has_newsletter_subscription !== "boolean"
    ) {
      return CommonErrors.badRequest("has_newsletter_subscription must be a boolean");
    }

    if (body.f_name.length > MAX_NAME_LEN || body.l_name.length > MAX_NAME_LEN) {
      return CommonErrors.badRequest(`f_name and l_name must be ${MAX_NAME_LEN} characters or fewer`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dob)) {
      return CommonErrors.badRequest("dob must be in YYYY-MM-DD format");
    }

    const fName = body.f_name.trim();
    const lName = body.l_name.trim();
    const role = "user";
    const hasNewsletterSubscription = body.has_newsletter_subscription ?? false;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const authActionToken = randomUUID();
    const authActionTokenExp = nowSeconds + ACCOUNT_ACTIVATION_TOKEN_TTL_SECONDS;

    const existingUser = await dynamodb.send(
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

    if (existingUser.Items?.length) {
      return CommonErrors.conflict("An account with this email already exists");
    }

    const createUserResult = await cognitoClient.send(
      new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        MessageAction: MessageActionType.SUPPRESS,
        TemporaryPassword: body.password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "email_verified", Value: "false" },
          { Name: "given_name", Value: fName },
          { Name: "family_name", Value: lName },
          { Name: "birthdate", Value: body.dob },
          { Name: "custom:role", Value: role },
        ],
      }),
    );

    const userId = createUserResult.User?.Attributes?.find((attribute) => attribute.Name === "sub")?.Value;
    if (!userId) {
      return CommonErrors.internalServerError("Registration failed: missing Cognito user id");
    }

    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: body.password,
        Permanent: true,
      }),
    );

    await cognitoClient.send(
      new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      }),
    );

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: "PROFILE",
          user_id: userId,
          email,
          f_name: fName,
          l_name: lName,
          dob: body.dob,
          role,
          is_virtual: false,
          ts: nowSeconds,
          banned: false,
          has_magazine_subscription: false,
          has_newsletter_subscription: hasNewsletterSubscription,
          artwork_emails_off: false,
          auth_action_token: authActionToken,
          auth_action_token_exp: authActionTokenExp,
          type: "USER",
          EMAIL_PK: emailPk(email),
          EMAIL_SK: emailGsiSk(EntityType.User),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    try {
      await sendRegistrationVerificationEmail({
        toEmail: email,
        userId,
        authActionToken,
      });
    } catch (error) {
      console.error("Default registration verification email failed:", error);
      try {
        await dynamodb.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { PK: `USER#${userId}`, SK: "PROFILE" },
          }),
        );
      } catch (cleanupError) {
        console.error("Default registration DDB cleanup failed:", cleanupError);
      }
      try {
        await cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: email,
          }),
        );
      } catch (cleanupError) {
        console.error("Default registration Cognito cleanup failed:", cleanupError);
      }
      return CommonErrors.internalServerError("Registration failed because the verification email could not be sent. Please try again later.");
    }

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify({
        message: "Registration successful. Please check your email for a verification link.",
        user_id: userId,
        delivery_medium: "EMAIL",
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("DefaultRegistration error:", error);
    if (error.name === "UsernameExistsException") {
      return CommonErrors.conflict("An account with this email already exists");
    }
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    if (error.name === "LimitExceededException") {
      return CommonErrors.tooManyRequests("Too many requests. Please try again later.");
    }
    return CommonErrors.internalServerError();
  }
};
