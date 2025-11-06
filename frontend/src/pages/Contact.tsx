import ContactImg from '@/assets/contact/contact-us.webp';
import { useWindowSize } from 'usehooks-ts';
import { useRef, useState } from 'react';
import { Field } from '@/types/HTMLFormTypes';

type ApiSuccess = { ok: true };
type ApiError = { error: string };
type ApiResponse = ApiSuccess | ApiError;

function isApiSuccess(r: ApiResponse): r is ApiSuccess {
  return 'ok' in r && r.ok === true;
}

function parseApiResponse(text: string): ApiResponse | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (('ok' in parsed && (parsed as { ok?: unknown }).ok === true) ||
        ('error' in parsed &&
          typeof (parsed as { error?: unknown }).error === 'string'))
    ) {
      return parsed as ApiResponse;
    }
    return null;
  } catch {
    return null;
  }
}

function getString(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

function clamp(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) : s;
}

const LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
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
    kind: 'input',
    name: 'subject',
    label: 'Subject*',
    type: 'text',
    required: true,
    autoComplete: 'on',
    maxLength: LIMITS.subject,
  },
  {
    kind: 'textarea',
    name: 'message',
    label: 'Message*',
    rows: 8,
    required: true,
    maxLength: LIMITS.message,
  },
] as const;

async function postContact(form: HTMLFormElement): Promise<void> {
  const fd = new FormData(form);

  const name = clamp(getString(fd, 'name').trim(), LIMITS.name);
  const email = clamp(getString(fd, 'email').trim(), LIMITS.email);
  const subject = clamp(getString(fd, 'subject').trim(), LIMITS.subject);
  const message = clamp(getString(fd, 'message').trim(), LIMITS.message);

  const params = new URLSearchParams();
  params.set('type', 'contact-us');
  params.set('name', name);
  params.set('email', email);
  params.set('subject', subject);
  params.set('message', message);

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

export const Contact = () => {
  const size = useWindowSize();
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

  const address = (
    <div className="mx-auto mt-12 max-w-2xl text-black">
      <p className="text-2xl font-bold">Address</p>
      <p className="mt-1 text-2xl font-extrabold">
        International Child Art Foundation
      </p>
      <p className="text-2xl leading-8">
        Post Office Box 58133
        <br />
        Washington, D.C. 20037
      </p>
    </div>
  );

  return (
    <div className="max-w-screen-2xl px-8 py-12 md:px-12 lg:px-16 xl:px-20">
      <div className="mb-10">
        <h1 className="font-montserrat text-5xl font-semibold">Contact Us</h1>
        <p className="text-2xl">We would love to hear from you.</p>
      </div>

      <div className="flex w-full grid-cols-1 grid-rows-2 flex-col rounded-xl lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_0.5fr] lg:bg-inherit">
        <div className="row-span-2 row-start-1 rounded-xl bg-slate-200/70 lg:col-span-2 lg:col-start-1 lg:row-span-1 lg:row-start-1" />

        <div className="col-span-1 col-start-1 row-span-2 row-start-1 m-6 rounded-2xl bg-white p-6 shadow-xl md:p-8">
          <form
            id="contactUsForm"
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
                  Sorry, we couldn’t send your message. Please try again.
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
              Thanks for contacting ICAF!
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

            <input type="hidden" name="type" value="contact-us" />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-auto w-full rounded-full bg-yellow-400 px-6 py-3 text-center text-sm font-bold tracking-widest text-slate-900 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="col-start-2 row-start-1 flex flex-col items-center p-6">
          <div className="flex flex-col">
            <div className="h-[500px] w-full">
              <img
                src={ContactImg}
                alt="Contact illustration"
                className="h-full rounded-xl object-cover"
              />
            </div>
            <p className="mt-4 text-center text-lg text-slate-600">
              Jesse Lackey, age 10, Alabama
            </p>
          </div>
        </div>
        {size.width >= 1024 && address}
      </div>
      {size.width < 1024 && address}
    </div>
  );
};
