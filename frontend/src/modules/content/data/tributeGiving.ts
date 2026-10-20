import type {
  ContactFormConfig,
  TributeFormId,
} from '@/modules/content/types/Contact';

const sharedConfig = {
  layout: 'simple',
  title: 'Send a message',
  subtitle:
    'Your request will be sent to ICAF. All fields marked * are required.',
  submitLabelIdle: 'Send Message',
  submitLabelSending: 'Sending…',
  successMessage:
    'Thank you for supporting our work that creates joy and restores hope for children. Your request has been sent to ICAF.',
  emailFallbackText: true,
} as const;

export const tributeFormConfigs: Record<TributeFormId, ContactFormConfig> = {
  'art-lovers': {
    ...sharedConfig,
    id: 'art-lovers',
    phpType: 'art-lovers',
    fields: [
      {
        kind: 'input',
        name: 'name',
        label: 'Your name',
        type: 'text',
        required: true,
        autoComplete: 'name',
        maxLength: 100,
      },
      {
        kind: 'input',
        name: 'email',
        label: 'Your email address',
        type: 'email',
        required: true,
        autoComplete: 'email',
        maxLength: 254,
      },
      {
        kind: 'input',
        name: 'honoreeName',
        label: 'Name of the Art Lover',
        type: 'text',
        required: true,
        maxLength: 100,
      },
      {
        kind: 'input',
        name: 'recipientEmail',
        label: 'Email address of the Art Lover',
        type: 'email',
        required: true,
        maxLength: 254,
      },
      {
        kind: 'input',
        name: 'occasion',
        label: 'On the occasion of',
        type: 'text',
        required: true,
        maxLength: 200,
      },
      {
        kind: 'textarea',
        name: 'message',
        label: 'Your message to the Art Lover',
        required: true,
        rows: 8,
        maxLength: 5000,
      },
    ],
    params: {
      name: { kind: 'field', field: 'name' },
      email: { kind: 'field', field: 'email' },
      honoreeName: { kind: 'field', field: 'honoreeName' },
      recipientEmail: { kind: 'field', field: 'recipientEmail' },
      occasion: { kind: 'field', field: 'occasion' },
      message: { kind: 'field', field: 'message' },
    },
  },
  'in-loving-memory': {
    ...sharedConfig,
    id: 'in-loving-memory',
    phpType: 'in-loving-memory',
    fields: [
      {
        kind: 'input',
        name: 'honoreeName',
        label: 'In loving memory of',
        type: 'text',
        required: true,
        maxLength: 100,
      },
      {
        kind: 'input',
        name: 'email',
        label: 'Your email',
        type: 'email',
        required: true,
        autoComplete: 'email',
        maxLength: 254,
      },
      {
        kind: 'input',
        name: 'recipientEmail',
        label: 'Email of family member',
        type: 'email',
        required: true,
        maxLength: 254,
      },
      {
        kind: 'input',
        name: 'relationship',
        label: 'Relationship of family member to the deceased',
        type: 'text',
        required: true,
        maxLength: 200,
      },
      {
        kind: 'textarea',
        name: 'message',
        label: 'Your message to the family member',
        required: true,
        rows: 8,
        maxLength: 5000,
      },
    ],
    params: {
      email: { kind: 'field', field: 'email' },
      honoreeName: { kind: 'field', field: 'honoreeName' },
      recipientEmail: { kind: 'field', field: 'recipientEmail' },
      relationship: { kind: 'field', field: 'relationship' },
      message: { kind: 'field', field: 'message' },
    },
  },
};
