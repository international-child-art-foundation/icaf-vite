export type ContactFormId = 'contact-us' | 'volunteer' | 'professionals';

export type ContactFieldKind = 'input' | 'textarea';

export interface ContactFieldBase {
  kind: ContactFieldKind;
  name: string;
  label: string;
  required?: boolean;
  maxLength?: number;
}

export interface ContactInputField extends ContactFieldBase {
  kind: 'input';
  type: 'text' | 'email';
  autoComplete?: string;
}

export interface ContactTextareaField extends ContactFieldBase {
  kind: 'textarea';
  rows?: number;
}

export type ContactField = ContactInputField | ContactTextareaField;

export type ContactLayout = 'contact-us' | 'simple';

export interface ContactAddressConfig {
  heading: string;
  organization: string;
  lines: string[];
}

export interface ContactImageConfig {
  src: string;
  alt: string;
  caption?: string;
}

export interface ContactMessageTemplateLiteralSegment {
  type: 'literal';
  text: string;
}

export interface ContactMessageTemplateFieldSegment {
  type: 'field';
  field: string;
  fallback?: string;
}

export type ContactMessageTemplateSegment =
  | ContactMessageTemplateLiteralSegment
  | ContactMessageTemplateFieldSegment;

export interface ContactMessageTemplate {
  segments: ContactMessageTemplateSegment[];
  joinWith?: string;
  maxLengthFrom?: 'messageTotalLimit';
}

export interface ContactParamFieldMapping {
  kind: 'field';
  field: string;
}

export interface ContactParamTemplateMapping {
  kind: 'template';
  template: ContactMessageTemplate;
}

export type ContactParamMapping =
  | ContactParamFieldMapping
  | ContactParamTemplateMapping;

export interface ContactFormConfig {
  id: ContactFormId;
  layout: ContactLayout;
  phpType: string;
  title: string;
  subtitle: string;
  submitLabelIdle: string;
  submitLabelSending: string;
  successMessage: string;
  fields: readonly ContactField[];
  params: Record<string, ContactParamMapping>;
  messageTotalLimit?: number;
  image?: ContactImageConfig;
  address?: ContactAddressConfig;
  emailFallbackText?: boolean;
  backgroundDecorationSrc?: string;
}
