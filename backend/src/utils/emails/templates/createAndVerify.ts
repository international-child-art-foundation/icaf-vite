import { APP_URL } from '../../../config/aws-clients';
import { htmlParagraphs, renderButton, renderEmailDocument, renderInfoBox, textParagraphs } from '../templateUtils';

export function buildCreateAndVerifyEmail(args: {
  userId: string;
  verifyToken: string;
}): { subject: string; text: string; html: string } {
  const link = `${APP_URL}/create-account?id=${encodeURIComponent(args.userId)}&token=${encodeURIComponent(args.verifyToken)}`;

  const subject = 'Create your ICAF account';
  const text = textParagraphs([
    'You requested to create an ICAF account associated with this email address.',
    'Use the link below to set your password and complete account creation:',
    link,
    'This link expires in 7 days. If you did not request this, you can safely ignore this email.',
    'The International Child Art Foundation',
  ]);

  const html = renderEmailDocument({
    preheader: 'Complete your ICAF account setup using the secure link below.',
    title: subject,
    headline: 'Complete your account setup',
    bodyHtml: [
      htmlParagraphs([
        'You requested to create an ICAF account associated with this email address.',
        'Use the secure link below to set your password and finish account creation.',
      ]),
      renderButton('Create your account', link),
      renderInfoBox('Account link', [
        'This link expires in 7 days.',
        `If the button does not work, open this URL: ${link}`,
      ]),
      htmlParagraphs([
        'If you did not request this email, you can ignore it.',
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
