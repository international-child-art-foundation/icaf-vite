import { UserEntity } from "@icaf/shared";
import { sendApprovalEmail } from "./approvalNotification";
import { ensureArtworkUnsubscribeToken, shouldSuppressArtworkEmail } from "./unsubscribe";

export async function sendApprovalEmailToUser(args: {
  user: UserEntity;
  type: "art" | "group";
  id: string;
  title?: string;
  theme?: string;
}): Promise<void> {
  if (shouldSuppressArtworkEmail(args.user)) {
    return;
  }

  const unsubscribeToken = await ensureArtworkUnsubscribeToken(args.user);

  await sendApprovalEmail({
    toEmail: args.user.email,
    userId: args.user.user_id,
    unsubscribeToken,
    type: args.type,
    id: args.id,
    title: args.title,
    theme: args.theme,
  });
}
