import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail } from 'lucide-react';
import Ribbons from '@/assets/home/Ribbons.svg';
import { linkClasses } from '@/data/linkClasses';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>(
    'idle',
  );

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('sending');

    const params = new URLSearchParams();
    params.set('type', 'subscribe');
    params.set('email', email.trim());

    try {
      const res = await fetch('/php-api/send-mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const text = (await res.text()).trim().toLowerCase();

      if (text === 'success') {
        setStatus('ok');
        setEmail('');

        // Notify Google Analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_label: 'homepage_newsletter',
            method: 'newsletter_form',
          });
        }
      } else {
        setStatus('err');
      }
    } catch {
      setStatus('err');
    }
  }

  return (
    <div className="relative flex w-full max-w-screen-2xl flex-col gap-20 py-12">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8">
        <div className="relative z-10 flex flex-col gap-6">
          <h2 className="font-montserrat text-center text-[32px] font-extrabold text-black md:text-[40px]">
            Stay Connected
          </h2>
          <p className="font-openSans mx-auto max-w-2xl text-center text-lg">
            Join our global community. Sign up to receive the ICAF newsletter
            for quarterly updates on child creativity, peace initiatives, and
            upcoming festivals.
          </p>
        </div>

        <div className="relative z-10">
          <div className="relative mx-auto max-w-5xl overflow-clip">
            <div className="relative z-10 rounded-2xl bg-[#dfe7f8] p-8 shadow-sm md:p-12 lg:p-16">
              <form
                onSubmit={(e) => void onSubscribe(e)}
                className="flex flex-col items-center gap-6 md:flex-row md:gap-4"
              >
                <div className="relative w-full flex-1">
                  <Mail
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus-visible:ring-primary h-14 w-full rounded-full border-none bg-white pl-12 text-lg outline-none ring-offset-0 focus-visible:ring-2"
                    required
                    maxLength={254}
                    autoComplete="email"
                    disabled={status === 'sending'}
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-secondary-yellow hover:bg-primary-alt h-14 w-full rounded-full px-10 text-lg font-bold text-black transition-all hover:shadow-lg md:w-auto"
                  variant="secondary"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>

              <div className="">
                {status === 'ok' && (
                  <p
                    className="mt-4 text-center text-sm font-semibold text-green-600 md:pl-6 md:text-left"
                    role="status"
                    aria-live="polite"
                  >
                    Thanks! You've been added to the list.
                  </p>
                )}
                {status === 'err' && (
                  <p
                    className="mt-4 text-center text-sm font-semibold text-red-500 md:pl-6 md:text-left"
                    role="alert"
                  >
                    Something went wrong. Please try again.
                  </p>
                )}
                {status === 'idle' && (
                  <p className="mt-4 text-center text-sm text-neutral-600 md:pl-6 md:text-left">
                    By signing up, you agree to our
                    <a
                      href="/documents/ICAF_Website_Privacy_Policy.pdf"
                      className={linkClasses}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {' '}
                      Privacy Policy
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-0 top-32 hidden w-full origin-[10%_90%] rotate-[80deg] overflow-hidden sm:origin-[10%_100%] md:absolute md:block md:origin-[0%_0%] md:rotate-[0deg] lg:top-16 xl:top-8">
        <img
          className="pointer-events-none min-w-[900px] select-none opacity-60 md:opacity-100"
          src={Ribbons}
          alt=""
        />
      </div>
    </div>
  );
};
