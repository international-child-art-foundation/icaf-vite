import DonateButtonPure from '@/components/ui/donateButtonPure';
import { Button } from '@/components/ui/button';

import { fireworkImage } from '@/assets/shared/images/partners';

export default function DonationCTA() {
  return (
    <section className="relative mx-2 my-8 max-w-screen-2xl rounded-xl bg-blue-50 p-8 py-8 md:mx-4 md:p-8 lg:mx-6 lg:p-12 xl:p-16">
      <div className="flex flex-col">
        <div className="max-w-2xl">
          <h2 className="font-montserrat mb-4 text-lg font-bold sm:text-xl md:text-2xl">
            Your donation today will bring the arts to more children and help
            them become creative and empathic.
          </h2>
          <div className="mt-6 flex space-x-2 sm:space-x-4 md:mt-8">
            <DonateButtonPure className="w-32 text-sm sm:w-40 sm:text-base" />
            <Button
              asChild
              variant="outline"
              className="h-14 rounded-full border-2 border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:border-blue-800 hover:bg-blue-800 sm:px-6 sm:text-base md:px-8"
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
        <div className="absolute right-8 top-6 w-24 sm:bottom-4 sm:right-4 sm:top-auto sm:w-32 md:bottom-0 md:right-8 md:w-48 lg:w-56">
          <img
            src={fireworkImage}
            alt="Colorful fireworks illustration"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
