import { AboutGraphic3 } from '@/assets/shared/images/about/AboutGraphic3';
import { Button } from '../ui/button';
import DonateButtonPure from '../ui/donateButtonPure';
import { Link } from 'react-router-dom';

export default function YourDonations() {
  return (
    <div className="mx-auto max-w-screen-2xl overflow-x-hidden py-16">
      <section className="mb-8 max-w-screen-2xl">
        <div className="relative flex h-[332px] w-full flex-col justify-center overflow-visible rounded-2xl bg-[#E0E8F8] px-6 md:h-[300px] md:px-12 lg:h-[320px] xl:h-[340px] 2xl:h-[400px]">
          {/* Graphic wrapper to prevent scroll pushing */}
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            <div className="absolute right-0 top-0 z-[10] -translate-y-[40%] translate-x-1/2 transform md:-translate-y-[-80%] md:translate-x-[40%] lg:translate-x-[20%] lg:translate-y-[70%] xl:translate-x-[25%] xl:translate-y-[35%] 2xl:translate-x-[25%] 2xl:translate-y-[15%]">
              <AboutGraphic3 className="h-36 w-36 md:h-52 md:w-52 lg:h-56 lg:w-56 xl:h-80 xl:w-80 2xl:h-96 2xl:w-96" />
            </div>
          </div>

          <p className="font-montserrat text-2xl font-semibold leading-relaxed md:max-w-[85%] 2xl:max-w-[70%]">
            Your donation today will bring the arts to more children and help
            them become creative and empathic.
          </p>
          <div className="mt-6 grid grid-cols-2 justify-center gap-2 sm:mx-auto sm:w-[80%] sm:gap-8 md:mx-[unset] md:w-[60%] md:justify-start lg:flex lg:flex-row lg:gap-6">
            <DonateButtonPure className="justify-left h-12 rounded-full font-sans text-base font-semibold lg:h-14 lg:w-36 2xl:text-xl" />
            <Link
              to="/contact"
              className="lg:justify-left flex h-12 w-full justify-center lg:inline-block lg:h-14 lg:w-40"
            >
              <Button className="h-full w-full rounded-full font-sans text-base 2xl:text-xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
