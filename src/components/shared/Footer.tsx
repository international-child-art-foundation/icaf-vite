import { InstagramIcon } from "@/assets/shared/icons/InstagramIcon";
import { FacebookIcon } from "@/assets/shared/icons/FacebookIcon";
import { TwitterIcon } from "@/assets/shared/icons/TwitterIcon";
import { YoutubeIcon } from "@/assets/shared/icons/YoutubeIcon";
import { LinkedinIcon } from "@/assets/shared/icons/LinkedinIcon";
import { PinterestIcon } from "@/assets/shared/icons/PinterestIcon";
import { EmailIcon } from "@/assets/shared/icons/EmailIcon";
import { HeartIcon } from "@/assets/shared/icons/HeartIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeartArrowIcon } from "@/assets/shared/icons/HeartArrowIcon";

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
    <footer className="bg-primary font-sans relative w-full mx-auto z-20 min-h-[670px]  md:min-h-[1200px] lg:min-h-[480px] xl:min-h-[310px]">
      <div className="mx-5% flex flex-wrap gap-y-10 pt-14 pb-10 px-6 md:px-11 md:pt-20 md:gap-y-20 lg:py-10 lg:pr-16 lg:pl-8 lg:gap-y-16  xl:px-20 justify-between xl:grid xl:grid-cols-12 xl:gap-x-8 xl:gap-y-16 xl:auto-rows-min">
        {/* Newsletter */}
        <div className="space-y-4 md:space-y-8 w-full tracking-wide text-base footer-inverse col-span-2  md:text-3xl md:col-span-3 lg:text-lg lg:order-1  lg:w-[42%] lg:space-y-6  xl:col-span-5 xl:w-full 2xl:text-xl">
          <p className="block lg:hidden">Get our quarterly newsletter</p>
          <p className="hidden lg:block">Join our quarterly newsletter here</p>
          <div className="flex flex-wrap lg:flex-nowrap  gap-1 lg:gap-2 items-center text-stone-700 focus-within:text-stone-900 xl:max-w-[85%]">
            <div className="flex flex-auto w-full lg:basis-3/5 ">
              <Input
                type="text"
                name="email"
                placeholder="Your email address"
                autoComplete="off"
                className="h-11 md:h-20 pl-16 md:pl-28 lg:h-10 lg:pl-12  pr-3 rounded-full placeholder:text-neutral-600 placeholder:text-sans md:text-3xl md:placeholder:text-3xl lg:placeholder:text-sm lg:pb-5"
              ></Input>
              <EmailIcon
                strokeWidth={2}
                className="absolute pointer-events-none w-6 h-6 mt-2.5 md:w-11 md:h-11 ml-6 md:ml-8 md:mt-5 lg:w-5 lg:h-5 lg:mt-2.5 lg:ml-4 stroke-neutral-400"
              />
            </div>
            <div className="w-full lg:basis-2/5">
              <Button
                variant="default"
                className=" h-11 md:h-20 lg:h-10 mt-2 md:mt-6 md:font-semibold lg:mt-0 w-full bg-secondary-yellow rounded-full text-black text-base md:text-3xl lg:text-sm text-sans font-normal hover:bg-secondary-yellow/90 "
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
                    className="fill-white md:h-[71px] md:w-[71px] lg:h-10 lg:w-10"
                    aria-hidden="true"
                  />
                </a>
              </div>
            ))}
          </ol>
        </div>
        {/* Links */}
        <div className=" w-full footer-inverse text-base md:text-3xl lg:text-base lg:order-2 lg:w-auto xl:col-start-6 xl:col-span-2 ">
          <ol className="grid grid-cols-2 gap-x-8 gap-y-5 md:justify-between md:pl-24 md:gap-x-16 md:gap-y-14 lg:grid-cols-1 lg:gap-y-4 lg:pl-0 lg:pr-14">
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
            <div className="grid grid-cols-2  gap-4 w-full md:gap-8 md:max-w-[97%] lg:max-w-[45%] ml-auto lg:mx-auto xl:max-w-full xl:order-last xl:col-start-4 xl:col-span-7 2xl:col-start-6 2xl:col-span-5 xl:grid-cols-1">
              <div className="flex justify-center">
                <Button
                  asChild
                  variant="default"
                  className="w-full h-14 md:h-24 lg:h-14 bg-secondary-yellow rounded-full text-black text-base md:text-3xl lg:text-base font-semibold hover:bg-secondary-yellow/90"
                >
                  <a
                    href="https://icaf.org/donate"
                    target="blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <HeartIcon
                      strokeWidth={2}
                      className="stroke-black !w-6 !h-6 md:!w-10 md:!h-10 md:mr-2  lg:!w-6 lg:!h-6 lg:mr-0"
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
                  className="w-full bg-primary h-14 md:h-24 lg:h-14 text-white text-base md:text-3xl lg:text-base font-medium rounded-full border-2"
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
            <HeartArrowIcon className="overflow-visible w-16 h-8 mt-4 md:w-32 md:h-16 md:mt-8 lg:w-16 lg:h-9 lg:mt-0 lg:pl-44 xl:h-8 xl:w-20  xl:pl-0 xl:my-auto 2xl:col-start-3 2xl:col-span-2 2xl:h-10 2xl:w-24" />
          </div>
        </div>
        {/* Copyright Notice */}
        <div className="bg-primary w-full footer-inverse order-5  place-items-center text-center text-sm md:text-2xl md:tracking-wide md:leading-10 lg:text-sm lg:flex lg:items-center lg:justify-center xl:mx-auto xl:col-span-12">
          <span className="text-lg  md:text-3xl lg:pr-2 lg:text-2xl">©</span>{" "}
          2025 International Children Art Foundation | 2549 Virginia Avenue, NW
          | Washington, DC 20037
        </div>
      </div>
    </footer>
  );
};

export default Footer;
