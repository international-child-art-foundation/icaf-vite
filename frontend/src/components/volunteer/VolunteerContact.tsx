import { useRef, useState } from 'react';
import { Field } from '@/types/HTMLFormTypes';
import { clamp, getString, parseApiResponse } from '@/lib/phpApiUtils';
import { isApiSuccess } from '@/lib/phpApiUtils';
import redBlueFirework from '@/assets/home/RedBlueFirework.svg';

const LIMITS = {
  name: 100,
  email: 254,
  expertise: 1000,
  contribution: 1000,
  motivation: 1500,
  messageTotal: 5000,
} as const;

const FIELDS: readonly Field[] = [
  {
    kind: 'input',
    name: 'name',
    label: 'Name*',
    type: 'text',
    required: true,
    autoComplete: 'name',
    maxLength: LIMITS.name,
  },
  {
    kind: 'input',
    name: 'email',
    label: 'Email*',
    type: 'email',
    required: true,
    autoComplete: 'email',
    maxLength: LIMITS.email,
  },
  {
    kind: 'textarea',
    name: 'expertise',
    label: 'Area of expertise',
    rows: 4,
    required: false,
    maxLength: LIMITS.expertise,
  },
  {
    kind: 'textarea',
    name: 'contribution',
    label: 'What you would like to do*',
    rows: 4,
    required: true,
    maxLength: LIMITS.contribution,
  },
  {
    kind: 'textarea',
    name: 'motivation',
    label: 'Why you want to join ICAF*',
    rows: 4,
    required: true,
    maxLength: LIMITS.motivation,
  },
] as const;

async function postContact(form: HTMLFormElement): Promise<void> {
  const fd = new FormData(form);

  const name = clamp(getString(fd, 'name').trim(), LIMITS.name);
  const email = clamp(getString(fd, 'email').trim(), LIMITS.email);
  const expertise = clamp(getString(fd, 'expertise').trim(), LIMITS.expertise);
  const contribution = clamp(
    getString(fd, 'contribution').trim(),
    LIMITS.contribution,
  );
  const motivation = clamp(
    getString(fd, 'motivation').trim(),
    LIMITS.motivation,
  );

  const combinedMessageRaw = [
    'Area of expertise:',
    expertise || '(not provided)',
    '',
    'How I can help:',
    contribution || '(not provided)',
    '',
    'Why I want to volunteer:',
    motivation || '(not provided)',
  ].join('\n');

  const message = clamp(combinedMessageRaw, LIMITS.messageTotal);

  const params = new URLSearchParams();
  params.set('type', 'volunteer');
  params.set('name', name);
  params.set('email', email);
  params.set('message', message);
  params.set('expertise', expertise);
  params.set('contribution', contribution);
  params.set('motivation', motivation);

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

export const VolunteerContact = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>(
    'idle',
  );
  const formRef = useRef<HTMLFormElement | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus('sending');
    void postContact(formRef.current)
      .then(() => {
        setStatus('ok');
        formRef.current?.reset();
      })
      .catch(() => setStatus('err'));
  };

  return (
    <div className="relative max-w-screen-2xl px-8 py-12 md:px-12 lg:px-16 xl:px-20">
      <img
        src={redBlueFirework}
        className="absolute right-4 top-12 z-[5] hidden h-64 w-64 opacity-50 lg:block"
      />

      <div className="mb-10">
        <h1 className="font-montserrat text-4xl font-semibold">
          Volunteer with ICAF
        </h1>
        <p className="text-2xl">
          Share a bit about yourself and how you'd like to help.
        </p>
      </div>

      <div className="relative flex w-full flex-col rounded-xl bg-slate-200/50">
        <div className="z-10 m-6 mx-auto w-full max-w-[min(600px,95%)] rounded-2xl bg-white p-6 shadow-xl md:p-8">
          <form
            id="volunteerForm"
            ref={formRef}
            className="flex h-full flex-col gap-6"
            noValidate
            onSubmit={onSubmit}
          >
            {status === 'err' && (
              <div>
                <div
                  className="mb-4 text-center text-sm font-semibold text-red-600"
                  role="alert"
                >
                  Sorry, we couldn't send your message. Please try again.
                </div>
                <div
                  className="mb-4 text-center text-sm font-semibold text-red-600"
                  role="alert"
                >
                  If this problem persists, please let us know by sending an
                  email to childart@icaf.org.
                </div>
              </div>
            )}
            <div
              className={
                status === 'ok'
                  ? 'block text-center text-xl font-bold text-green-700'
                  : 'hidden'
              }
              role="status"
              aria-live="polite"
            >
              Thanks for your interest in volunteering with ICAF!
            </div>

            <input
              type="text"
              name="website"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />

            {FIELDS.map((field) => {
              const id = field.name;
              if (field.kind === 'input') {
                return (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label
                      htmlFor={id}
                      className="block text-2xl font-semibold text-black"
                    >
                      {field.label}
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
                  <label
                    htmlFor={id}
                    className="block text-2xl font-semibold text-black"
                  >
                    {field.label}
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
            })}

            <input type="hidden" name="type" value="volunteer" />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-auto w-full rounded-full bg-yellow-400 px-6 py-3 text-center text-sm font-bold tracking-widest text-slate-900 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Submit Form'}
            </button>
          </form>
        </div>
      </div>
      <div className="ml-auto mt-4 max-w-2xl text-black">
        <p className="mx-8 text-center text-2xl lg:text-right">
          If you would prefer to contact us by email, please send your message
          to <span className="font-semibold">childart@icaf.org</span>.
        </p>
      </div>
    </div>
  );
};
