import {
  ApiGatewayEvent,
  HTTP_STATUS,
  COMMON_HEADERS,
  CommonErrors,
  UserProfileResponse,
} from "@icaf/shared";
import { getCurrentUser } from "../../utils/auth";

export const handler = async (
  event: ApiGatewayEvent,
): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
  try {
    const currentUser = await getCurrentUser(event);
    if (!currentUser.ok) return currentUser.response;
    const { user } = currentUser;

    const response: UserProfileResponse = {
      user_id: user.user_id,
      email: user.email,
      f_name: user.f_name,
      l_name: user.l_name,
      role: user.role ?? "user",
      is_virtual: user.is_virtual,
      banned: user.banned,
      has_magazine_subscription: user.has_magazine_subscription ?? false,
      has_newsletter_subscription: user.has_newsletter_subscription ?? false,
      artwork_emails_off: user.artwork_emails_off === true,
      verified_at: user.verified_at,
      emailed_signup_at: user.emailed_signup_at,
      timestamp: user.timestamp,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      body: JSON.stringify(response),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return CommonErrors.internalServerError();
  }
};
