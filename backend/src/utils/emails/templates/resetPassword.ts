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
  const link = `${APP_URL}/confirm-forgot-password?id=${userId}&token=${token}`;
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

export function buildActivateAccountFromForgotPasswordEmail(args: {
  userId: string;
  authActionToken: string;
}) {
  const userId = encodeURIComponent(args.userId);
  const token = encodeURIComponent(args.authActionToken);
  const link = `${APP_URL}/confirm-forgot-password?mode=activate&id=${userId}&token=${token}`;
  const subject = "Activate your ICAF account";

  return {
    subject,
    text: textParagraphs([
      "We found an ICAF account for this email address that has not been activated yet.",
      "Use this secure link to choose a password and activate your account:",
      link,
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
    ]),
    html: renderEmailDocument({
      preheader: "Choose a password and activate your ICAF account.",
      title: subject,
      headline: "Activate your account",
      bodyHtml: [
        htmlParagraphs([
          "We found an ICAF account for this email address that has not been activated yet.",
          "Use the secure link below to choose a new password and activate your account.",
        ]),
        renderButton("Set password and activate", link),
        renderInfoBox("Activation link", [
          "This link expires in 1 hour.",
          `If the button does not work, open this URL: ${link}`,
        ]),
        htmlParagraphs(["If you did not request this, you can ignore this email."]),
      ].join(""),
    }),
  };
}
