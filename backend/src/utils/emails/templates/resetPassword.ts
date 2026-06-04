import { APP_URL } from "../../../config/aws-clients";

export function buildResetPasswordEmail(args: { userId: string; authActionToken: string }) {
  const link = `${APP_URL}/reset-password?id=${encodeURIComponent(args.userId)}&token=${encodeURIComponent(args.authActionToken)}`;

  return {
    subject: "Reset your ICAF password",
    text: [
      "Use this link to reset your ICAF password:",
      link,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: [
      "<p>Use this link to reset your ICAF password:</p>",
      `<p><a href="${link}">Reset password</a></p>`,
      "<p>If you did not request this, you can ignore this email.</p>",
    ].join(""),
  };
}
