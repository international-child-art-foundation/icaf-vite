import { useRef, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { clamp, parseApiResponse, isApiSuccess } from '@/lib/phpApiUtils';
import type {
  ContactFormConfig,
  ContactField,
  ContactMessageTemplate,
} from '@/types/Contact';

type Status = 'idle' | 'sending' | 'ok' | 'err';

type ErrorType = 'none' | 'validation' | 'server';

interface ContactFormProps {
  config: ContactFormConfig;
}

function getLabelWithoutAsterisk(label: string): string {
  return label.replace(/\*+$/, '').trim();
}

function isValidEmail(value: string): boolean {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function getFormDataString(fd: FormData, name: string): string {
  const value = fd.get(name);
  return typeof value === 'string' ? value : '';
}

function collectFieldValues(
  config: ContactFormConfig,
  fd: FormData,
): Record<string, string> {
  const values: Record<string, string> = {};
  config.fields.forEach((field) => {
    const raw = getFormDataString(fd, field.name).trim();
    if (typeof field.maxLength === 'number') {
      values[field.name] = clamp(raw, field.maxLength);
    } else {
      values[field.name] = raw;
    }
  });
  return values;
}

function buildTemplateMessage(
  template: ContactMessageTemplate,
  values: Record<string, string>,
  config: ContactFormConfig,
): string {
  const raw = template.segments
    .map((segment) => {
      if (segment.type === 'literal') {
        return segment.text;
      }
      const v = values[segment.field] ?? '';
      if (!v.trim() && segment.fallback) {
        return segment.fallback;
      }
      return v;
    })
    .join(template.joinWith ?? '');
  if (
    template.maxLengthFrom === 'messageTotalLimit' &&
    config.messageTotalLimit
  ) {
    return clamp(raw, config.messageTotalLimit);
  }
  return raw;
}

async function postContact(
  form: HTMLFormElement,
  config: ContactFormConfig,
): Promise<void> {
  const fd = new FormData(form);

  const website = getFormDataString(fd, 'website').trim();
  if (website.length > 0) {
    return;
  }

  const values = collectFieldValues(config, fd);
  const params = new URLSearchParams();
  params.set('type', config.phpType);

  Object.entries(config.params).forEach(([paramName, mapping]) => {
    if (mapping.kind === 'field') {
      params.set(paramName, values[mapping.field] ?? '');
    } else if (mapping.kind === 'template') {
      const message = buildTemplateMessage(mapping.template, values, config);
      params.set(paramName, message);
    }
  });

  const res = await fetch('/php-api/send-mail.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await res.text();
  const data = parseApiResponse(text);

  if (res.ok && data && isApiSuccess(data)) return;
  if (res.ok && text.trim().toLowerCase() === 'success') return;

  throw new Error('send_failed');
}

function validateForm(
  config: ContactFormConfig,
  fd: FormData,
): { missingRequired: string[]; invalidEmail: boolean } {
  const missingRequired: string[] = [];
  let invalidEmail = false;

  config.fields.forEach((field) => {
    const raw = getFormDataString(fd, field.name).trim();

    if (field.required && !raw) {
      missingRequired.push(getLabelWithoutAsterisk(field.label));
    }

    if (field.kind === 'input' && field.type === 'email') {
      if (!isValidEmail(raw)) {
        invalidEmail = true;
      }
    }
  });

  return { missingRequired, invalidEmail };
}

function buildValidationMessage(result: {
  missingRequired: string[];
  invalidEmail: boolean;
}): string[] {
  const parts: string[] = [];

  if (result.invalidEmail) {
    parts.push('Please enter a valid email address.');
  }

  if (result.missingRequired.length > 0) {
    const plural = result.missingRequired.length > 1 ? 's' : '';
    parts.push(`Please fill in the required field${plural}:`);
    result.missingRequired.map((str) => {
      parts.push(str);
    });
  }

  return parts;
}

function renderField(field: ContactField) {
  const id = field.name;

  if (field.kind === 'input') {
    return (
      <div key={field.name} className="flex flex-col gap-1">
        <label htmlFor={id} className="block text-2xl font-semibold text-black">
          {field.label}
          {field.required && '*'}
        </label>
        <input
          type={field.type}
          id={id}
          name={field.name}
          required={field.required}
          autoComplete={field.autoComplete}
          maxLength={field.maxLength}
          className="w-full rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
        />
      </div>
    );
  }

  return (
    <div key={field.name} className="flex flex-col gap-1">
      <label htmlFor={id} className="block text-2xl font-semibold text-black">
        {field.label}
        {field.required && '*'}
      </label>
      <textarea
        id={id}
        name={field.name}
        required={field.required}
        rows={field.rows ?? 6}
        spellCheck={true}
        maxLength={field.maxLength}
        className="w-full resize-y rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </div>
  );
}

export const ContactForm = ({ config }: ContactFormProps) => {
  const size = useWindowSize();
  const [status, setStatus] = useState<Status>('idle');
  const [errorType, setErrorType] = useState<ErrorType>('none');
  const [validationMessage, setValidationMessage] = useState<string[] | null>(
    null,
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const HEADER_OFFSET = 0;
  const scrollToSection = () => {
    if (containerRef.current) {
      const y =
        containerRef.current.getBoundingClientRect().top +
        window.scrollY -
        HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    scrollToSection();

    setErrorType('none');
    setValidationMessage(null);

    const fd = new FormData(formRef.current);
    const validationResult = validateForm(config, fd);

    if (
      validationResult.invalidEmail ||
      validationResult.missingRequired.length > 0
    ) {
      setStatus('idle');
      setErrorType('validation');
      setValidationMessage(buildValidationMessage(validationResult));
      return;
    }

    setStatus('sending');
    void postContact(formRef.current, config)
      .then(() => {
        setStatus('ok');
        formRef.current?.reset();
      })
      .catch(() => {
        setStatus('err');
        setErrorType('server');
      });
  };

  const successVisible = status === 'ok';

  const baseForm = (
    <form
      id={`${config.id}-form`}
      ref={formRef}
      className="flex h-full flex-col gap-6"
      noValidate
      onSubmit={onSubmit}
    >
      {errorType === 'validation' && validationMessage && (
        <div
          className="mb-4 flex flex-col gap-2 text-sm font-semibold text-red-600"
          role="alert"
        >
          {validationMessage.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      {errorType === 'server' && (
        <div>
          <div
            className="mb-4 text-center text-sm font-semibold text-red-600"
            role="alert"
          >
            Sorry, we couldn&apos;t send your message. Please try again.
          </div>
          <div
            className="mb-4 text-center text-sm font-semibold text-red-600"
            role="alert"
          >
            If this problem persists, please let us know by sending an email to
            childart@icaf.org.
          </div>
        </div>
      )}

      <div
        className={
          successVisible
            ? 'block text-center text-xl font-bold text-green-700'
            : 'hidden'
        }
        role="status"
        aria-live="polite"
      >
        {config.successMessage}
      </div>

      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
      />

      {config.fields.map((field) => renderField(field))}

      <input type="hidden" name="type" value={config.phpType} />

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-auto w-full rounded-full bg-yellow-400 px-6 py-3 text-center text-sm font-bold tracking-widest text-slate-900 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
      >
        {status === 'sending'
          ? config.submitLabelSending
          : config.submitLabelIdle}
      </button>
    </form>
  );

  if (config.layout === 'contact-us') {
    const addressBlock = config.address ? (
      <div className="mx-auto mt-12 max-w-2xl text-black">
        <p className="text-2xl font-bold">{config.address.heading}</p>
        <p className="mt-1 text-2xl font-extrabold">
          {config.address.organization}
        </p>
        <p className="text-2xl leading-8">
          {config.address.lines.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </div>
    ) : null;

    return (
      <div
        ref={containerRef}
        className="max-w-screen-2xl px-8 py-12 md:px-12 lg:px-16 xl:px-20"
      >
        <div className="mb-10">
          <h1 className="font-montserrat text-5xl font-semibold">
            {config.title}
          </h1>
          <p className="text-2xl">{config.subtitle}</p>
        </div>

        <div className="flex w-full grid-cols-1 grid-rows-2 flex-col rounded-xl lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_0.5fr] lg:bg-inherit">
          <div className="row-span-2 row-start-1 rounded-xl bg-slate-200/70 lg:col-span-2 lg:col-start-1 lg:row-span-1 lg:row-start-1" />

          <div className="col-span-1 col-start-1 row-span-2 row-start-1 m-6 rounded-2xl bg-white p-6 shadow-xl md:p-8">
            {baseForm}
          </div>

          {config.image && (
            <div className="col-start-2 row-start-1 flex flex-col items-center p-6">
              <div className="flex flex-col">
                <div className="h-[500px] w-full">
                  <img
                    src={config.image.src}
                    alt={config.image.alt}
                    className="h-full rounded-xl object-cover"
                  />
                </div>
                {config.image.caption && (
                  <p className="mt-4 text-center text-lg text-slate-600">
                    {config.image.caption}
                  </p>
                )}
              </div>
            </div>
          )}
          {size.width >= 1024 && addressBlock}
        </div>
        {size.width < 1024 && addressBlock}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative max-w-screen-2xl px-8 py-12 md:px-12 lg:px-16 xl:px-20"
    >
      {config.backgroundDecorationSrc && (
        <img
          src={config.backgroundDecorationSrc}
          className="absolute right-4 top-12 z-[5] hidden h-64 w-64 opacity-50 lg:block"
        />
      )}

      <div className="mb-10">
        <h1 className="font-montserrat text-4xl font-semibold">
          {config.title}
        </h1>
        <p className="text-2xl">{config.subtitle}</p>
      </div>

      <div className="relative flex w-full flex-col rounded-xl bg-slate-200/50">
        <div className="z-10 m-6 mx-auto w-full max-w-[min(600px,95%)] rounded-2xl bg-white p-6 shadow-xl md:p-8">
          {baseForm}
        </div>
      </div>

      {config.emailFallbackText && (
        <div className="ml-auto mt-4 max-w-2xl text-black">
          <p className="mx-8 text-center text-2xl lg:text-right">
            If you would prefer to contact us by email, please send your message
            to <span className="font-semibold">childart@icaf.org</span>
          </p>
        </div>
      )}
    </div>
  );
};
