import { APP_URL } from '../../../config/aws-clients';
import { htmlParagraphs, renderButton, renderEmailDocument, renderInfoBox, renderLink, textParagraphs } from '../templateUtils';
import { buildArtworkUnsubscribeUrl } from '../unsubscribe';

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
  const unsubscribeUrl = buildArtworkUnsubscribeUrl(args.userId, args.unsubscribeToken);
  const titleLine = args.title ? `"${args.title}"` : `Your ${label}`;

  const subject = `${titleLine} has been approved!`;
  const text = textParagraphs([
    `Great news! ${titleLine} has been reviewed and approved by the ICAF team.`,
    `It is now visible in the ICAF gallery:`,
    galleryUrl,
    'Thank you for your contribution to ICAF!',
    'To stop receiving ICAF artwork notification emails, use this link:',
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
      htmlParagraphs(['Thank you for your contribution to ICAF.']),
      [
        '<div style="margin-top:26px;padding-top:16px;border-top:1px solid #cfe2f3;font-size:12px;line-height:1.5;color:#6b7280;">',
        '<p style="margin:0 0 8px;">If you no longer want ICAF artwork notification emails, you can unsubscribe below.</p>',
        `<p style="margin:0;font-size:12px;">${renderLink(unsubscribeUrl, 'Unsubscribe from notification emails')}</p>`,
        '</div>',
      ].join(''),
    ].join(''),
  });

  return {
    subject,
    text,
    html,
  };
}
