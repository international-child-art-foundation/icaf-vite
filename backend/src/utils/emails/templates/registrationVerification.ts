import { APP_URL } from '../../../config/aws-clients';
import {
  htmlParagraphs,
  renderButton,
  renderEmailDocument,
  renderInfoBox,
  textParagraphs,
} from '../templateUtils';

export function buildRegistrationVerificationEmail(args: {
  userId: string;
  authActionToken: string;
}): { subject: string; text: string; html: string } {
  const userId = encodeURIComponent(args.userId);
  const token = encodeURIComponent(args.authActionToken);
  const link = `${APP_URL}/verify-account?id=${userId}&token=${token}`;

  const subject = 'Verify your ICAF account';
  const text = textParagraphs([
    'Thanks for registering for an ICAF account.',
    'Use the link below to verify your email address and activate your account:',
    link,
    'This link expires in 7 days. If you did not create an account, you can safely ignore this email.',
    'The International Child Art Foundation',
  ]);

  const html = renderEmailDocument({
    preheader: 'Verify your email address to activate your ICAF account.',
    title: subject,
    headline: 'Verify your email',
    bodyHtml: [
      htmlParagraphs([
        'Thanks for registering for an ICAF account.',
        'Use the secure link below to verify your email address and activate your account.',
      ]),
      renderButton('Verify account', link),
      renderInfoBox('Verification link', [
        'This link expires in 7 days.',
        `If the button does not work, open this URL: ${link}`,
      ]),
      htmlParagraphs([
        'If you did not create an account, you can ignore this email.',
        'This message was sent by the International Child Art Foundation.',
      ]),
    ].join(''),
  });

  return {
    subject,
    text,
    html,
  };
}
