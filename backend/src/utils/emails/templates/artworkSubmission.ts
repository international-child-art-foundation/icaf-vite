import { APP_URL } from '../../../config/aws-clients';
import {
  htmlParagraphs,
  renderButton,
  renderEmailDocument,
  renderInfoBox,
  textParagraphs,
} from '../templateUtils';

export function buildArtworkSubmissionEmail(args: {
  userId: string;
  authActionToken: string;
}): { subject: string; text: string; html: string } {
  const userId = encodeURIComponent(args.userId);
  const token = encodeURIComponent(args.authActionToken);
  const link = `${APP_URL}/create-account?id=${userId}&token=${token}`;

  const subject = 'Thanks for your artwork submission to ICAF!';
  const text = textParagraphs([
    'The International Child Art Foundation is delighted to receive your artwork submission.',
    'After a short approval process, your artwork will be displayed in our gallery.',
    'If you would like to create an ICAF account to view and manage your artwork submissions under this email address, use the link below:',
    link,
    'Account creation is optional and can be completed at any time. This link expires in 7 days, but you can always request a new one later.',
    'Thank you for participating in ICAF!',
  ]);

  const html = renderEmailDocument({
    preheader: 'Your artwork submission was received and is now in review.',
    title: subject,
    headline: 'Your artwork is in review',
    bodyHtml: [
      htmlParagraphs([
        'The International Child Art Foundation is delighted to receive your artwork submission.',
        'After a short approval process, your artwork will be displayed in our gallery.',
      ]),
      renderButton('Create an ICAF account', link),
      renderInfoBox('Optional account setup', [
        'Use this link if you want to manage submissions from this email address.',
        'Account creation is optional and can be completed later if you prefer.',
        `If the button does not work, open this URL: ${link}`,
      ]),
      htmlParagraphs(['Thank you for participating in ICAF!']),
    ].join(''),
  });

  return {
    subject,
    text,
    html,
  };
}
