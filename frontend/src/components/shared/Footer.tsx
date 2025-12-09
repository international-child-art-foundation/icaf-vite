import { InstagramIcon } from '@/assets/shared/icons/InstagramIcon';
import { FacebookIcon } from '@/assets/shared/icons/FacebookIcon';
import { TwitterIcon } from '@/assets/shared/icons/TwitterIcon';
import { YoutubeIcon } from '@/assets/shared/icons/YoutubeIcon';
import { LinkedinIcon } from '@/assets/shared/icons/LinkedinIcon';
import { PinterestIcon } from '@/assets/shared/icons/PinterestIcon';
import { Button } from '@/components/ui/button';
import { HeartArrowIcon } from '@/assets/shared/icons/HeartArrowIcon';
import { Mail } from 'lucide-react';
import DonateButton from '../ui/donateButton';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useGlobalContext } from './GlobalContext';

const icons = [
  {
    SVGcomponent: FacebookIcon,
    altText: 'Facebook link',
    href: 'https://www.facebook.com/ICAF.org',
  },
  {
    SVGcomponent: InstagramIcon,
    altText: 'Instagram link',
    href: 'https://www.instagram.com/intlchildartfoundation/',
  },
  {
    SVGcomponent: YoutubeIcon,
    altText: 'Youtube link',
    href: 'https://www.youtube.com/channel/UCvvipwdFEaNnTSv0EIhznaQ',
  },
  {
    SVGcomponent: TwitterIcon,
    altText: 'Twitter link',
    href: 'https://www.twitter.com/ICAF_org',
  },
  {
    SVGcomponent: PinterestIcon,
    altText: 'Pinterest link',
    href: 'https://www.pinterest.com/icaf/',
  },
  {
    SVGcomponent: LinkedinIcon,
    altText: 'Linkedin link',
    href: 'https://www.linkedin.com/company/international-child-art-foundation',
  },
];

function Footer() {
  const { setCookieBannerVisible } = useGlobalContext();
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
      } else {
        setStatus('err');
      }
    } catch {
      setStatus('err');
    }
  }

  const year = new Date().getFullYear();

  return (
    <footer className="2xl:min:h-[310px] bg-primary relative z-20 mx-auto min-h-[670px] w-full font-sans lg:min-h-[480px] xl:min-h-[310px]">
      <div className="mx-5% mx-auto flex flex-wrap justify-between gap-y-10 px-8 pb-10 pt-14 md:max-w-[750px] md:px-12 lg:max-w-screen-2xl lg:gap-y-16 lg:px-16 lg:py-10 xl:grid xl:auto-rows-min xl:grid-cols-12 xl:gap-x-8 xl:gap-y-16 xl:px-20">
        <div className="footer-inverse col-span-2 w-full space-y-4 text-base tracking-wide lg:order-1 lg:w-[42%] lg:space-y-6 lg:text-lg xl:col-span-5 xl:w-full 2xl:text-xl">
          <p className="block">Get our quarterly newsletter</p>
          <div className="flex flex-col gap-2">
            <form
              onSubmit={(e) => void onSubscribe(e)}
              className="flex flex-wrap items-center gap-1 text-stone-700 focus-within:text-stone-900 lg:flex-nowrap lg:gap-2 xl:max-w-[85%]"
            >
              <div className="flex h-11 w-full flex-auto items-center rounded-full bg-white pl-4 pr-2 lg:h-10">
                <Mail aria-hidden="true" className="mr-2 h-5 w-5" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="placeholder:text-sans h-full w-full bg-transparent text-base outline-none placeholder:text-neutral-600"
                  required
                  maxLength={254}
                  autoComplete="email"
                />
              </div>
              <input type="hidden" name="type" value="subscribe" />
              <div className="w-full lg:max-w-[9.25rem] 2xl:max-w-[10.7rem]">
                <Button
                  type="submit"
                  variant="secondary"
                  className="text-sans mt-2 w-full rounded-full text-base font-normal text-black lg:mt-0 lg:text-sm"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Signing up…' : 'Sign up'}
                </Button>
              </div>
            </form>
            {status === 'ok' && (
              <div
                className="mt-2 w-full text-sm font-semibold text-white"
                role="status"
                aria-live="polite"
              >
                Thanks! You've been added to the list.
              </div>
            )}
            {status === 'err' && (
              <div
                className="mt-2 w-full text-sm font-semibold text-red-400"
                role="alert"
              >
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:order-3 lg:my-auto lg:w-1/5 xl:col-span-2 xl:col-start-8 xl:my-0 xl:w-full">
          <ol className="my-2 grid w-full grid-flow-col justify-between lg:my-0 lg:grid-flow-row lg:grid-cols-3 lg:place-items-center lg:gap-6">
            {icons.map((icon) => (
              <div key={icon.href}>
                <a
                  aria-label={icon.altText}
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <icon.SVGcomponent
                    className="fill-white lg:h-10 lg:w-10"
                    aria-hidden="true"
                  />
                </a>
              </div>
            ))}
          </ol>
        </div>
        <div className="footer-inverse w-full text-base lg:order-2 lg:w-auto lg:text-base xl:col-span-2 xl:col-start-6">
          <ol className="grid grid-cols-2 gap-x-8 gap-y-5 lg:grid-cols-1 lg:gap-y-4 lg:pl-0 lg:pr-14">
            {/* <div className="break-words">
              <a href="/faq">FAQs</a>
            </div> */}
            <div className="break-words">
              <Link to="/contact">Contact Us</Link>
            </div>
            <div className="break-words">
              <a
                href="/documents/ICAF_Website_Terms_of_Use.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of use
              </a>
            </div>
            <div className="break-words">
              <a
                href="/documents/ICAF_Website_Privacy_Policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy policy
              </a>
            </div>
            <div
              className="cursor-pointer break-words"
              onClick={() => setCookieBannerVisible(true)}
            >
              Cookie Settings
            </div>
          </ol>
        </div>
        <div className="min-h-[100px] w-full lg:order-4 xl:col-span-3 xl:col-start-10">
          <div className="grid grid-cols-1 xl:grid-cols-10">
            <div className="ml-auto grid w-full grid-cols-2 gap-4 lg:mx-auto lg:max-w-[45%] xl:order-last xl:col-span-7 xl:col-start-4 xl:max-w-full xl:grid-cols-1 2xl:col-span-5 2xl:col-start-6">
              <DonateButton className="lg:h-14 lg:text-base" text="Donate" />
              <div className="flex justify-center">
                <Link to={'/contact'} className="w-full">
                  <Button
                    variant="outline"
                    className="bg-primary h-14 w-full rounded-full border-2 text-base font-medium tracking-wide text-white hover:font-semibold lg:h-14 lg:text-base"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <HeartArrowIcon className="mt-4 h-8 w-16 overflow-visible lg:mt-0 lg:h-9 lg:w-16 lg:pl-44 xl:my-auto xl:h-8 xl:w-20 xl:pl-0 2xl:col-span-2 2xl:col-start-3 2xl:h-10 2xl:w-24" />
          </div>
        </div>
        <div className="footer-inverse bg-primary order-5 w-full place-items-center text-center text-sm lg:flex lg:items-center lg:justify-center lg:text-sm xl:col-span-12 xl:mx-auto">
          <span className="text-lg lg:pr-2 lg:text-2xl">©</span> {year}{' '}
          International Child Art Foundation | Post Office Box 58133 |
          Washington, DC 20037
        </div>
      </div>
    </footer>
  );
}

export default Footer;
