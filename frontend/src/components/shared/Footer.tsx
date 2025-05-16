import { InstagramIcon } from '@/assets/shared/icons/InstagramIcon';
import { FacebookIcon } from '@/assets/shared/icons/FacebookIcon';
import { TwitterIcon } from '@/assets/shared/icons/TwitterIcon';
import { YoutubeIcon } from '@/assets/shared/icons/YoutubeIcon';
import { LinkedinIcon } from '@/assets/shared/icons/LinkedinIcon';
import { PinterestIcon } from '@/assets/shared/icons/PinterestIcon';
import { Button } from '@/components/ui/button';
import { HeartArrowIcon } from '@/assets/shared/icons/HeartArrowIcon';
import { InputIconWrapper } from '../ui/InputIconWrapper';
import { Mail } from 'lucide-react';
import DonateButton from '../ui/donateButton';

const icons = [
  {
    SVGcomponent: FacebookIcon,
    altText: "Visit the International Child Art Foundation's Facebook page",
    href: 'https://www.facebook.com/ICAF.org',
  },
  {
    SVGcomponent: InstagramIcon,
    altText: "Visit the International Child Art Foundation's Instagram page",
    href: 'https://www.instagram.com/intlchildartfoundation/',
  },
  {
    SVGcomponent: YoutubeIcon,
    altText: "Visit the International Child Art Foundation's Youtube page",
    href: 'https://www.youtube.com/channel/UCvvipwdFEaNnTSv0EIhznaQ',
  },
  {
    SVGcomponent: TwitterIcon,
    altText: "Visit the International Child Art Foundation's Twitter page",
    href: 'https://www.twitter.com/ICAF_org',
  },
  {
    SVGcomponent: PinterestIcon,
    altText: "Visit the International Child Art Foundation's Pinterest page",
    href: 'https://www.pinterest.com/icaf/',
  },
  {
    SVGcomponent: LinkedinIcon,
    altText: "Visit the International Child Art Foundation's Linkedin page",
    href: 'https://www.linkedin.com/company/international-child-art-foundation',
  },
];

const Footer = () => {
  return (
    <footer className="2xl:min:h-[310px] relative z-20 mx-auto min-h-[670px] w-full bg-primary font-sans lg:min-h-[480px] xl:min-h-[310px]">
      <div className="mx-5% mx-auto flex flex-wrap justify-between gap-y-10 px-8 pb-10 pt-14 md:max-w-[750px] md:px-12 lg:max-w-screen-2xl lg:gap-y-16 lg:px-16 lg:py-10 xl:grid xl:auto-rows-min xl:grid-cols-12 xl:gap-x-8 xl:gap-y-16 xl:px-20">
        {/* Newsletter */}
        <div className="footer-inverse col-span-2 w-full space-y-4 text-base tracking-wide lg:order-1 lg:w-[42%] lg:space-y-6 lg:text-lg xl:col-span-5 xl:w-full 2xl:text-xl">
          <p className="block">Get our quarterly newsletter</p>
          <div className="flex flex-wrap items-center gap-1 text-stone-700 focus-within:text-stone-900 lg:flex-nowrap lg:gap-2 xl:max-w-[85%]">
            <div className="flex h-11 w-full flex-auto lg:h-10">
              <InputIconWrapper
                icon={Mail}
                placeholder="Your email address"
                className="placeholder:text-sans flex rounded-full bg-white placeholder:text-neutral-600 lg:placeholder:text-sm"
              />
            </div>
            <div className="w-full lg:max-w-[9.25rem] 2xl:max-w-[10.7rem]">
              <Button
                variant="secondary"
                className="text-sans mt-2 w-full rounded-full text-base font-normal text-black lg:mt-0 lg:text-sm"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
        {/* Social Icons */}
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
        {/* Links */}
        <div className="footer-inverse w-full text-base lg:order-2 lg:w-auto lg:text-base xl:col-span-2 xl:col-start-6">
          <ol className="grid grid-cols-2 gap-x-8 gap-y-5 lg:grid-cols-1 lg:gap-y-4 lg:pl-0 lg:pr-14">
            <div className="break-words">
              <a href="/faq">FAQs</a>
            </div>
            <div className="break-words">
              <a
                href="https://icaf.org/about/contact-us"
                target="blank"
                rel="noopener noreferrer"
              >
                Contact Us
              </a>
            </div>
            <div className="break-words">
              <a href="https://icaf.org/resource/documents/ICAF.website.-.Terms.of.Use.pdf">
                Terms of use
              </a>
            </div>
            <div className="break-words">
              <a href="https://icaf.org/resource/documents/ICAF.website.-.Privacy.Policy.pdf">
                Privacy policy
              </a>
            </div>
            {/* <div className="break-words">
              <a href="https://icaf.org/resource/documents/ICAF.website.-.Privacy.Policy.pdf">
                COPPA Notice
              </a>
            </div>
            <div className="break-words">
              <a href="https://icaf.org/resource/documents/ICAF.website.-.Privacy.Policy.pdf">
                Cookie Settings
              </a>
            </div> */}
          </ol>
        </div>

        {/* <div className="flex flex-wrap max-w-sm md:max-w-full md:justify-center md:gap-9 w-full md:order-4 lg:w-auto lg:flex-col lg:gap-5"> 
          <div className="w-1/2 md:w-auto">
            <div className="flex flex-col w-auto items-left md:items-center">
              <a href="#" className="group w-32 lg:w-32 h-fit border-white border rounded text-center py-3 px-5 text-sm cursor-pointer tracking-wide bg-white text-[#134380]">
                <HeartIcon />
                Donate
              </a>
              <div className="heart-white me-auto my-2"></div>
            </div>
          </div>
          <div className="w-1/2 md:w-auto">
            <div className="flex flex-col w-auto items-left md:items-center">
              <a href="https://icaf.org/about/contact-us" target="blank" rel="noopener noreferrer" className="w-32 h-fit border-white border rounded text-center py-3 px-6 text-sm cursor-pointer tracking-wide text-white">Contact Us</a>
            </div>
          </div> 
        </div>  */}

        {/* Donate/Contact Buttons*/}
        <div className="min-h-[100px] w-full lg:order-4 xl:col-span-3 xl:col-start-10">
          <div className="grid grid-cols-1 xl:grid-cols-10">
            {/* Donate Button */}
            <div className="ml-auto grid w-full grid-cols-2 gap-4 lg:mx-auto lg:max-w-[45%] xl:order-last xl:col-span-7 xl:col-start-4 xl:max-w-full xl:grid-cols-1 2xl:col-span-5 2xl:col-start-6">
              <DonateButton className="lg:h-14 lg:text-base" />

              {/* Contact Us Button */}
              <div className="flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="h-14 w-full rounded-full border-2 bg-primary text-base font-medium tracking-wide text-white hover:font-semibold lg:h-14 lg:text-base"
                >
                  <a
                    href="https://icaf.org/about/contact-us"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </Button>
              </div>
            </div>
            <HeartArrowIcon className="mt-4 h-8 w-16 overflow-visible lg:mt-0 lg:h-9 lg:w-16 lg:pl-44 xl:my-auto xl:h-8 xl:w-20 xl:pl-0 2xl:col-span-2 2xl:col-start-3 2xl:h-10 2xl:w-24" />
          </div>
        </div>
        {/* Copyright Notice */}
        <div className="footer-inverse order-5 w-full place-items-center bg-primary text-center text-sm lg:flex lg:items-center lg:justify-center lg:text-sm xl:col-span-12 xl:mx-auto">
          <span className="text-lg lg:pr-2 lg:text-2xl">©</span> 2025
          International Children Art Foundation | 2549 Virginia Avenue, NW |
          Washington, DC 20037
        </div>
      </div>
    </footer>
  );
};

export default Footer;
