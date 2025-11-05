import ContactImg from '@/assets/contact/contact-us.webp';
import { useWindowSize } from 'usehooks-ts';
import { useRef, useState } from 'react';

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

async function postContact(form: HTMLFormElement): Promise<void> {
  const fd = new FormData(form);
  const name = getString(fd, 'name').trim();
  const email = getString(fd, 'email').trim();
  const message = getString(fd, 'message').trim();

  const params = new URLSearchParams();
  params.set('type', 'contact-us');
  params.set('name', name);
  params.set('email', email);
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
      <p className="mt-2 text-2xl leading-8">
        123 Main Street
        <br />
        Suite 400
        <br />
        Washington, DC 20001
        <br />
        United States
      </p>
    </div>
  );

  return (
    <div className="max-w-screen-2xl px-8 py-12 md:px-12 lg:px-16 xl:px-20">
      <div className="mb-10">
        <h1 className="font-montserrat text-5xl font-semibold">Contact Us</h1>
        <p className="mt-2 text-2xl">We would love to hear from you.</p>
      </div>

      <div className="flex w-full grid-cols-1 grid-rows-2 flex-col rounded-xl lg:grid lg:grid-cols-[1fr_1fr] lg:grid-rows-[1fr_0.5fr] lg:bg-inherit">
        <div className="row-span-2 row-start-1 rounded-xl bg-slate-200/70 lg:col-span-2 lg:col-start-1 lg:row-span-1 lg:row-start-1"></div>

        <div className="col-span-1 col-start-1 row-span-2 row-start-1 m-6 rounded-2xl bg-white p-6 shadow-xl md:p-8">
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

          {status === 'err' && (
            <div
              className="mb-4 text-center text-sm font-semibold text-red-600"
              role="alert"
            >
              Sorry, we couldn’t send your message. Please try again.
            </div>
          )}

          <form
            id="contactUsForm"
            ref={formRef}
            className="mt-2 space-y-5"
            noValidate
            onSubmit={onSubmit}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-2xl font-semibold text-black"
              >
                Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-2xl font-semibold text-black"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-2xl font-semibold text-black"
              >
                Subject*
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                autoComplete="on"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-2xl font-semibold text-black"
              >
                Message*
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={8}
                spellCheck={true}
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-slate-100/50 px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <input type="hidden" name="type" value="contact-us" />

            <div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-full bg-yellow-400 px-6 py-3 text-center text-sm font-bold tracking-widest text-slate-900 transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </div>
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
