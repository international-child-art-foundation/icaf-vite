import { APP_URL } from "../../../config/aws-clients";
import {
  htmlParagraphs,
  renderButton,
  renderEmailDocument,
  renderInfoBox,
  textParagraphs,
} from "../templateUtils";

export function buildResetPasswordEmail(args: {
  userId: string;
  authActionToken: string;
}) {
  const userId = encodeURIComponent(args.userId);
  const token = encodeURIComponent(args.authActionToken);
  const link = `${APP_URL}/reset-password?id=${userId}&token=${token}`;
  const subject = "Reset your ICAF password";

  return {
    subject,
    text: textParagraphs([
      "Use this link to reset your ICAF password:",
      link,
      "If you did not request this, you can ignore this email.",
    ]),
    html: renderEmailDocument({
      preheader: "Reset your ICAF account password.",
      title: subject,
      headline: "Reset your password",
      bodyHtml: [
        htmlParagraphs([
          "Use the secure link below to reset your ICAF password.",
        ]),
        renderButton("Reset password", link),
        renderInfoBox("Password reset link", [
          "This link expires in 1 hour.",
          `If the button does not work, open this URL: ${link}`,
        ]),
        htmlParagraphs(["If you did not request this, you can ignore this email."]),
      ].join(""),
    }),
  };
}
