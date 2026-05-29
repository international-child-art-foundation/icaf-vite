import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  cognitoClient,
  dynamodb,
  TABLE_NAME,
  USER_POOL_CLIENT_ID,
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
} from "@icaf/shared";
import { EntityType, GSI } from "../../dynamo/ddbSchemaConsts";
import { emailGsiSk, emailPk } from "../../dynamo/emailGsi";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<DefaultRegistrationRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.email?.trim()) return CommonErrors.badRequest("email is required");
    if (body.email.length > MAX_EMAIL_LEN) return CommonErrors.badRequest(`email must be ${MAX_EMAIL_LEN} characters or less`);
    if (!body.password) return CommonErrors.badRequest("password is required");
    if (body.password.length > MAX_PASSWORD_LEN) return CommonErrors.badRequest(`password must be ${MAX_PASSWORD_LEN} characters or less`);
    if (!body.f_name?.trim()) return CommonErrors.badRequest("f_name is required");
    if (!body.l_name?.trim()) return CommonErrors.badRequest("l_name is required");
    if (!body.dob?.trim()) return CommonErrors.badRequest("dob is required");
    if (body.role !== "guardian" && body.role !== "user") {
      return CommonErrors.badRequest("role must be one of: guardian, user");
    }
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

    const email = body.email.trim();
    const fName = body.f_name.trim();
    const lName = body.l_name.trim();
    const role = body.role;
    const hasNewsletterSubscription = body.has_newsletter_subscription ?? false;
    const nowSeconds = Math.floor(Date.now() / 1000);

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

    const signUpResult = await cognitoClient.send(
      new SignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: email,
        Password: body.password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "given_name", Value: fName },
          { Name: "family_name", Value: lName },
          { Name: "birthdate", Value: body.dob },
          { Name: "custom:role", Value: role },
        ],
      }),
    );

    if (!signUpResult.UserSub) {
      return CommonErrors.internalServerError("Registration failed: missing Cognito user id");
    }

    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${signUpResult.UserSub}`,
          SK: "PROFILE",
          user_id: signUpResult.UserSub,
          email,
          f_name: fName,
          l_name: lName,
          dob: body.dob,
          role,
          is_virtual: false,
          timestamp: nowSeconds,
          banned: false,
          has_magazine_subscription: false,
          has_newsletter_subscription: hasNewsletterSubscription,
          type: "USER",
          EMAIL_PK: emailPk(email),
          EMAIL_SK: emailGsiSk(EntityType.User),
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify({
        message: "Registration successful. Please check your email for a verification link.",
        user_id: signUpResult.UserSub,
        delivery_medium: signUpResult.CodeDeliveryDetails?.DeliveryMedium ?? "EMAIL",
        destination: signUpResult.CodeDeliveryDetails?.Destination,
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
