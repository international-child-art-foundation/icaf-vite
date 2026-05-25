import { APP_URL } from '../../../config/aws-clients';
import { htmlParagraphs, renderButton, renderEmailDocument, renderInfoBox, renderLink, textParagraphs } from '../templateUtils';

export function buildApprovalEmail(args: {
  userId: string;
  unsubscribeToken: string;
  type: 'art' | 'group';
  id: string;
  title?: string;
}): { subject: string; text: string; html: string } {
  const isGroup = args.type === 'group';
  const label = isGroup ? 'group submission' : 'artwork';
  const galleryUrl = isGroup
    ? `${APP_URL}/gallery/group/${encodeURIComponent(args.id)}`
    : `${APP_URL}/gallery/artwork/${encodeURIComponent(args.id)}`;
  const unsubscribeUrl = `${APP_URL}/unsubscribe/artwork?u=${encodeURIComponent(args.userId)}&t=${encodeURIComponent(args.unsubscribeToken)}`;
  const titleLine = args.title ? `"${args.title}"` : `Your ${label}`;

  const subject = `${titleLine} has been approved!`;
  const text = textParagraphs([
    `Great news! ${titleLine} has been reviewed and approved by the ICAF team.`,
    `It is now visible in the ICAF gallery:`,
    galleryUrl,
    'Thank you for your contribution to ICAF!',
    'To stop receiving artwork and group notification emails from ICAF, use this link:',
    unsubscribeUrl,
  ]);

  const html = renderEmailDocument({
    preheader: `Your ${label} is approved and visible in the ICAF gallery.`,
    title: subject,
    headline: 'Your submission has been approved',
    bodyHtml: [
      htmlParagraphs([
        `Great news! ${titleLine} has been reviewed and approved by the ICAF team.`,
        'It is now visible in the ICAF gallery.',
      ]),
      renderButton('View in the gallery', galleryUrl),
      renderInfoBox('Approval details', [
        `Item: ${args.title ?? `Your ${label}`}`,
        `Gallery link: ${galleryUrl}`,
        'Status: approved',
      ]),
      htmlParagraphs([
        'Thank you for your contribution to ICAF.',
        'If you no longer want artwork notification emails, you can unsubscribe below.',
      ]),
      `<p style="margin:0;">${renderLink(unsubscribeUrl, 'Unsubscribe from artwork emails')}</p>`,
    ].join(''),
    footerNote: 'This stops artwork notification emails for this ICAF account.',
  });

  return {
    subject,
    text,
    html,
  };
}
