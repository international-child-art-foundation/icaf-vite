import {
  AdminCreateUserCommand,
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
    if (!body.verify_token?.trim()) return CommonErrors.badRequest("verify_token is required");
    if (body.f_name !== undefined && (!body.f_name.trim() || body.f_name.length > MAX_NAME_LEN)) {
      return CommonErrors.badRequest(`f_name must be 1-${MAX_NAME_LEN} characters when provided`);
    }
    if (body.l_name !== undefined && (!body.l_name.trim() || body.l_name.length > MAX_NAME_LEN)) {
      return CommonErrors.badRequest(`l_name must be 1-${MAX_NAME_LEN} characters when provided`);
    }
    if (body.dob !== undefined && !DOB_RE.test(body.dob)) {
      return CommonErrors.badRequest("dob must be in YYYY-MM-DD format");
    }
    if (body.role !== undefined && body.role !== "guardian" && body.role !== "user") {
      return CommonErrors.badRequest("role must be one of: guardian, user");
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
      return CommonErrors.notFound("User not found");
    }

    const user = result.Item as UserEntity;

    if (user.verify_token !== body.verify_token) {
      return CommonErrors.badRequest("Invalid verification token");
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (user.verify_token_expiration !== undefined && user.verify_token_expiration < nowSeconds) {
      return CommonErrors.badRequest("Verification token has expired");
    }

    const fName = body.f_name?.trim() ?? user.f_name;
    const lName = body.l_name?.trim() ?? user.l_name;
    const dob = body.dob ?? user.dob;
    const role = body.role ?? user.role ?? "user";

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
    } else if (body.f_name !== undefined || body.l_name !== undefined || body.dob !== undefined || body.role !== undefined) {
      await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: user.email,
          UserAttributes: [
            ...(body.f_name !== undefined && fName ? [{ Name: "given_name", Value: fName }] : []),
            ...(body.l_name !== undefined && lName ? [{ Name: "family_name", Value: lName }] : []),
            ...(body.dob !== undefined && dob ? [{ Name: "birthdate", Value: dob }] : []),
            ...(body.role !== undefined ? [{ Name: "custom:role", Value: role }] : []),
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
          `SET ${setExprParts.join(", ")} REMOVE verify_token, verify_token_expiration`,
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
