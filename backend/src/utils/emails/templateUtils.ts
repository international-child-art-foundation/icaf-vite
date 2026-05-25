const EMAIL_BACKGROUND = '#f4f1eb';
const EMAIL_CARD = '#ffffff';
const EMAIL_TEXT = '#1f2933';
const EMAIL_BORDER = '#dde3e8';
const EMAIL_BUTTON = '#0f3b57';
const EMAIL_LINK = '#0f5c8a';
const EMAIL_FOOTER = '#6b7280';
const EMAIL_BRAND = '#0f3b57';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function textParagraphs(paragraphs: Array<string | undefined | null>): string {
  return paragraphs.filter((value): value is string => Boolean(value?.trim())).join('\n\n');
}

export function htmlParagraphs(paragraphs: Array<string | undefined | null>): string {
  return paragraphs
    .filter((value): value is string => Boolean(value?.trim()))
    .map((paragraph) => `<p style="margin:0 0 16px;">${escapeHtml(paragraph)}</p>`)
    .join('');
}

export function renderLink(url: string, label?: string): string {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label ?? url);

  return `<a href="${safeUrl}" style="color:${EMAIL_LINK};text-decoration:underline;word-break:break-word;">${safeLabel}</a>`;
}

export function renderButton(label: string, url: string): string {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);

  return [
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">',
    '<tr>',
    `<td bgcolor="${EMAIL_BUTTON}" style="border-radius:10px;">`,
    `<a href="${safeUrl}" style="display:inline-block;padding:14px 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;background:${EMAIL_BUTTON};border-radius:10px;">${safeLabel}</a>`,
    '</td>',
    '</tr>',
    '</table>',
  ].join('');
}

export function renderInfoBox(title: string, lines: string[]): string {
  const safeTitle = escapeHtml(title);
  const safeLines = lines
    .filter((value) => value.trim().length > 0)
    .map((line) => `<div style="margin-top:6px;">${escapeHtml(line)}</div>`)
    .join('');

  return [
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;border:1px solid ${EMAIL_BORDER};border-radius:14px;background:#fbfcfd;">`,
    '<tr>',
    '<td style="padding:18px 20px;">',
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_FOOTER};font-weight:700;">${safeTitle}</div>`,
    `<div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${EMAIL_TEXT};">${safeLines}</div>`,
    '</td>',
    '</tr>',
    '</table>',
  ].join('');
}

export function renderEmailDocument(args: {
  preheader: string;
  title: string;
  headline: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const safePreheader = escapeHtml(args.preheader);
  const safeTitle = escapeHtml(args.title);
  const safeHeadline = escapeHtml(args.headline);
  const footerNote = args.footerNote ?? 'If you need help, reply to this email and we will route your message to the right person.';

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${safeTitle}</title>`,
    '</head>',
    `<body style="margin:0;padding:0;background:${EMAIL_BACKGROUND};font-family:Arial,Helvetica,sans-serif;color:${EMAIL_TEXT};">`,
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${safePreheader}</div>`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1eb;padding:32px 16px;">',
    '<tr>',
    '<td align="center">',
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:${EMAIL_CARD};border:1px solid ${EMAIL_BORDER};border-radius:18px;overflow:hidden;">`,
    '<tr>',
    `<td style="padding:28px 32px 10px;border-bottom:1px solid ${EMAIL_BORDER};background:linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);">`,
    `<div style="font-size:12px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_BRAND};font-weight:700;">International Child Art Foundation</div>`,
    `<h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;color:${EMAIL_TEXT};">${safeHeadline}</h1>`,
    '</td>',
    '</tr>',
    '<tr>',
    '<td style="padding:28px 32px 32px;">',
    `<div style="font-size:16px;line-height:1.7;color:${EMAIL_TEXT};">${args.bodyHtml}</div>`,
    `<div style="margin-top:28px;padding-top:18px;border-top:1px solid ${EMAIL_BORDER};font-size:13px;line-height:1.6;color:${EMAIL_FOOTER};">${escapeHtml(footerNote)}</div>`,
    '</td>',
    '</tr>',
    '</table>',
    '</td>',
    '</tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}
