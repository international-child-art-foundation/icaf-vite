import { InstagramIcon } from "@/assets/shared/icons/InstagramIcon";
import { FacebookIcon } from "@/assets/shared/icons/FacebookIcon";
import { TwitterIcon } from "@/assets/shared/icons/TwitterIcon";
import { YoutubeIcon } from "@/assets/shared/icons/YoutubeIcon";
import { LinkedinIcon } from "@/assets/shared/icons/LinkedinIcon";
import { PinterestIcon } from "@/assets/shared/icons/PinterestIcon";
import { HeartIcon } from "@/assets/shared/icons/HeartIcon";
import { Button } from "@/components/ui/button";
import { HeartArrowIcon } from "@/assets/shared/icons/HeartArrowIcon";
import { InputIconWrapper } from "../ui/InputIconWrapper";
import { Mail } from "lucide-react";

const icons = [
  {
    SVGcomponent: FacebookIcon,
    altText: "Visit the International Child Art Foundation's Facebook page",
    href: "https://www.facebook.com/ICAF.org",
  },
  {
    SVGcomponent: InstagramIcon,
    altText: "Visit the International Child Art Foundation's Instagram page",
    href: "https://www.instagram.com/intlchildartfoundation/",
  },
  {
    SVGcomponent: YoutubeIcon,
    altText: "Visit the International Child Art Foundation's Youtube page",
    href: "https://www.youtube.com/channel/UCvvipwdFEaNnTSv0EIhznaQ",
  },
  {
    SVGcomponent: TwitterIcon,
    altText: "Visit the International Child Art Foundation's Twitter page",
    href: "https://www.twitter.com/ICAF_org",
  },
  {
    SVGcomponent: PinterestIcon,
    altText: "Visit the International Child Art Foundation's Pinterest page",
    href: "https://www.pinterest.com/icaf/",
  },
  {
    SVGcomponent: LinkedinIcon,
    altText: "Visit the International Child Art Foundation's Linkedin page",
    href: "https://www.linkedin.com/company/international-child-art-foundation",
  },
];

const Footer = () => {
  return (
    <footer className="bg-primary font-sans relative w-full mx-auto z-20 min-h-[670px] lg:min-h-[480px] xl:min-h-[310px] 2xl:min:h-[310px]">
      <div
        className="mx-5% flex flex-wrap gap-y-10 pt-14 pb-10 mx-auto
      lg:py-10 lg:gap-y-16  
      justify-between xl:grid xl:grid-cols-12 xl:gap-x-8 xl:gap-y-16 xl:auto-rows-min 
      px-8 md:px-12 lg:px-16 xl:px-20 md:max-w-[750px] lg:max-w-screen-2xl"
      >
        {/* Newsletter */}
        <div
          className="space-y-4 w-full tracking-wide text-base footer-inverse col-span-2 
        lg:text-lg lg:order-1  lg:w-[42%] lg:space-y-6  
        xl:col-span-5 xl:w-full 2xl:text-xl"
        >
          <p className="block">Get our quarterly newsletter</p>
          <div className="flex flex-wrap lg:flex-nowrap  gap-1 lg:gap-2 items-center text-stone-700 focus-within:text-stone-900 xl:max-w-[85%]">
            <div className="flex flex-auto w-full h-11 lg:h-10 ">
              <InputIconWrapper
                icon={Mail}
                placeholder="Your email address"
                className="flex bg-white rounded-full placeholder:text-neutral-600 placeholder:text-sans lg:placeholder:text-sm"
              />
            </div>
            <div className="w-full lg:max-w-[9.25rem] 2xl:max-w-[10.7rem]">
              <Button
                variant="secondary"
                className="text-sans w-full rounded-full text-black  font-normal mt-2 lg:mt-0 text-base lg:text-sm"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
        {/* Social Icons */}
        <div className="w-full lg:w-1/5 xl:w-full lg:order-3 lg:my-auto xl:my-0 xl:col-start-8 xl:col-span-2">
          <ol className="grid lg:place-items-center lg:gap-6 my-2 lg:grid-cols-3 grid-flow-col lg:grid-flow-row justify-between w-full lg:my-0">
            {icons.map((icon, i) => (
              <div key={i}>
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
        <div className=" w-full footer-inverse text-base lg:text-base lg:order-2 lg:w-auto xl:col-start-6 xl:col-span-2 ">
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
        <div className="w-full lg:order-4  min-h-[100px] xl:col-start-10 xl:col-span-3">
          <div className="grid grid-cols-1 xl:grid-cols-10">
            {/* Donate Button */}
            <div
              className="grid grid-cols-2  gap-4 w-full ml-auto lg:max-w-[45%] lg:mx-auto 
            xl:max-w-full xl:order-last xl:col-start-4 xl:col-span-7 xl:grid-cols-1 2xl:col-start-6 2xl:col-span-5 "
            >
              <div className="flex justify-center">
                <Button
                  asChild
                  variant="secondary"
                  className="w-full h-14 lg:h-14 rounded-full text-base lg:text-base font-semibold tracking-wide"
                >
                  <a
                    href="https://icaf.org/donate"
                    target="blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <HeartIcon
                      strokeWidth={2}
                      className="stroke-black !w-6 !h-6 lg:!w-6 lg:!h-6 lg:mr-0"
                    />
                    Donate
                  </a>
                </Button>
              </div>

              {/* Contact Us Button */}
              <div className="flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-primary h-14 lg:h-14 text-white text-base lg:text-base font-medium tracking-wide rounded-full border-2 hover:font-semibold"
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
            <HeartArrowIcon
              className="overflow-visible w-16 h-8 mt-4 
            lg:w-16 lg:h-9 lg:mt-0 lg:pl-44 xl:h-8 
            xl:w-20  xl:pl-0 xl:my-auto 
            2xl:col-start-3 2xl:col-span-2 2xl:h-10 2xl:w-24"
            />
          </div>
        </div>
        {/* Copyright Notice */}
        <div
          className="bg-primary w-full footer-inverse order-5  place-items-center text-center text-sm 
        lg:text-sm lg:flex lg:items-center lg:justify-center 
        xl:mx-auto xl:col-span-12"
        >
          <span className="text-lg lg:pr-2 lg:text-2xl">©</span> 2025
          International Children Art Foundation | 2549 Virginia Avenue, NW |
          Washington, DC 20037
        </div>
      </div>
    </footer>
  );
};

export default Footer;
