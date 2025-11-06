export type BaseField = {
  name: 'name' | 'email' | 'subject' | 'message';
  label: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
};

export type InputField = BaseField & {
  kind: 'input';
  type: 'text' | 'email';
};

export type TextareaField = BaseField & {
  kind: 'textarea';
  rows?: number;
};

export type Field = InputField | TextareaField;
