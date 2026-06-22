import {
  AdminCreateUserCommand,
  AdminEnableUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
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
  CreateAndVerifyRequest,
  UserEntity,
  MAX_NAME_LEN,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<CreateAndVerifyRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.user_id?.trim()) return CommonErrors.badRequest("user_id is required");
    if (body.f_name !== undefined && (!body.f_name.trim() || body.f_name.length > MAX_NAME_LEN)) {
      return CommonErrors.badRequest(`f_name must be 1-${MAX_NAME_LEN} characters when provided`);
    }
    if (body.l_name !== undefined && (!body.l_name.trim() || body.l_name.length > MAX_NAME_LEN)) {
      return CommonErrors.badRequest(`l_name must be 1-${MAX_NAME_LEN} characters when provided`);
    }
    if (body.dob !== undefined && !DOB_RE.test(body.dob)) {
      return CommonErrors.badRequest("dob must be in YYYY-MM-DD format");
    }
    if (
      body.has_newsletter_subscription !== undefined &&
      typeof body.has_newsletter_subscription !== "boolean"
    ) {
      return CommonErrors.badRequest("has_newsletter_subscription must be a boolean");
    }

    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${body.user_id}`, SK: "PROFILE" },
      }),
    );

    if (!result.Item) {
      return CommonErrors.notFound("We could not find this account. Please contact us for help.");
    }

    const user = result.Item as UserEntity;

    if (user.verified_at) {
      return {
        statusCode: HTTP_STATUS.OK,
        body: JSON.stringify({ message: "This account is already verified", already_verified: true }),
        headers: COMMON_HEADERS,
      };
    }

    if (!body.auth_action_token?.trim()) {
      return CommonErrors.badRequest("authentication token is required");
    }

    if (user.auth_action_token !== body.auth_action_token) {
      return CommonErrors.badRequest("Invalid authentication token");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (user.auth_action_token_exp !== undefined && user.auth_action_token_exp < nowSeconds) {
      return CommonErrors.badRequest("Authentication token has expired");
    }

    const fName = body.f_name?.trim() ?? user.f_name;
    const lName = body.l_name?.trim() ?? user.l_name;
    const dob = body.dob ?? user.dob;
    const role = user.role ?? "user";

    // Virtual users originate from non-signup actions. They get a Cognito login
    // only when they follow the emailed link and choose a password here.
    if (user.is_virtual) {
      if (!body.password) {
        return CommonErrors.badRequest("password is required to create your account");
      }

      await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          MessageAction: MessageActionType.SUPPRESS,
          UserAttributes: [
            { Name: "email", Value: user.email },
            { Name: "email_verified", Value: "true" },
            { Name: "custom:role", Value: role },
            ...(fName ? [{ Name: "given_name", Value: fName }] : []),
            ...(lName ? [{ Name: "family_name", Value: lName }] : []),
            ...(dob ? [{ Name: "birthdate", Value: dob }] : []),
          ],
        }),
      );

      await cognitoClient.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          Password: body.password,
          Permanent: true,
        }),
      );
    } else {
      if (body.password) {
        await cognitoClient.send(
          new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: user.email,
            Password: body.password,
            Permanent: true,
          }),
        );
      }

      await cognitoClient.send(
        new AdminEnableUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
        }),
      );

      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          UserAttributes: [
            { Name: "email_verified", Value: "true" },
            ...(body.f_name !== undefined && fName ? [{ Name: "given_name", Value: fName }] : []),
            ...(body.l_name !== undefined && lName ? [{ Name: "family_name", Value: lName }] : []),
            ...(body.dob !== undefined && dob ? [{ Name: "birthdate", Value: dob }] : []),
          ],
        }),
      );
    }

    const setExprParts = [
      "verified_at = :now",
      "is_virtual = :false",
      "#role = :role",
      "has_magazine_subscription = if_not_exists(has_magazine_subscription, :false)",
      "has_newsletter_subscription = :newsletter",
    ];
    const exprValues: Record<string, unknown> = {
      ":now": nowSeconds,
      ":false": false,
      ":role": role,
      ":newsletter": body.has_newsletter_subscription ?? user.has_newsletter_subscription ?? false,
    };
    if (fName !== undefined) {
      setExprParts.push("f_name = :fName");
      exprValues[":fName"] = fName;
    }
    if (lName !== undefined) {
      setExprParts.push("l_name = :lName");
      exprValues[":lName"] = lName;
    }
    if (dob !== undefined) {
      setExprParts.push("dob = :dob");
      exprValues[":dob"] = dob;
    }

    await dynamodb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${body.user_id}`, SK: "PROFILE" },
        UpdateExpression:
          `SET ${setExprParts.join(", ")} REMOVE auth_action_token, auth_action_token_exp`,
        ExpressionAttributeNames: { "#role": "role" },
        ExpressionAttributeValues: exprValues,
      }),
    );

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify({ message: "Account verified successfully" }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("CreateAndVerify error:", error);
    if (error.name === "UsernameExistsException") {
      return CommonErrors.conflict("A Cognito account already exists for this email");
    }
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    return CommonErrors.internalServerError();
  }
};
