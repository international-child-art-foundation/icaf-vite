import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, USER_POOL_CLIENT_ID } from "../../config/aws-clients";
import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  RegisterRequest,
  MAX_NAME_LEN,
  MAX_EMAIL_LEN,
  MAX_PASSWORD_LEN,
} from "@icaf/shared";
import { parseJsonBody } from "../../utils/request";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const parsedBody = parseJsonBody<RegisterRequest>(event);
    if (!parsedBody.ok) return parsedBody.response;
    const body = parsedBody.value;

    if (!body.email?.trim()) return CommonErrors.badRequest("email is required");
    if (body.email.length > MAX_EMAIL_LEN) return CommonErrors.badRequest(`email must be ${MAX_EMAIL_LEN} characters or less`);
    if (!body.password) return CommonErrors.badRequest("password is required");
    if (body.password.length > MAX_PASSWORD_LEN) return CommonErrors.badRequest(`password must be ${MAX_PASSWORD_LEN} characters or less`);
    if (!body.f_name?.trim()) return CommonErrors.badRequest("f_name is required");
    if (!body.l_name?.trim()) return CommonErrors.badRequest("l_name is required");
    if (!body.dob?.trim()) return CommonErrors.badRequest("dob is required");

    if (body.f_name.length > MAX_NAME_LEN || body.l_name.length > MAX_NAME_LEN) {
      return CommonErrors.badRequest(`f_name and l_name must be ${MAX_NAME_LEN} characters or fewer`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.dob)) {
      return CommonErrors.badRequest("dob must be in YYYY-MM-DD format");
    }

    const signUpResult = await cognitoClient.send(
      new SignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: body.email.trim(),
        Password: body.password,
        UserAttributes: [
          { Name: "email", Value: body.email.trim() },
          { Name: "given_name", Value: body.f_name.trim() },
          { Name: "family_name", Value: body.l_name.trim() },
          { Name: "birthdate", Value: body.dob },
        ],
      }),
    );

    return {
      statusCode: HTTP_STATUS.CREATED,
      body: JSON.stringify({
        message: "Registration successful. Please check your email to verify your account.",
        user_id: signUpResult.UserSub,
      }),
      headers: COMMON_HEADERS,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.name === "UsernameExistsException") {
      return CommonErrors.conflict("An account with this email already exists");
    }
    if (error.name === "InvalidPasswordException") {
      return CommonErrors.badRequest("Password does not meet requirements");
    }
    return CommonErrors.internalServerError();
  }
};
