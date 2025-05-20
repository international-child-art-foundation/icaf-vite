import { AboutGraphic3 } from '@/assets/shared/images/about/AboutGraphic3';
import { Button } from '../ui/button';
import DonateButton from '../ui/donateButton';

export default function YourDonations() {
  return (
    <section className="my-24">
      <div className="2xl:h[400px] relative flex h-[332px] w-full flex-col justify-center rounded-2xl bg-[#E0E8F8] px-4 md:h-[300px] lg:h-[320px] lg:px-8 xl:h-[340px]">
        <div className="absolute right-0 top-0 z-[10] -translate-y-[40%] translate-x-1/2 transform md:-translate-y-[-80%] md:translate-x-[40%] lg:translate-x-[20%] lg:translate-y-[70%] xl:translate-x-[25%] xl:translate-y-[35%] 2xl:translate-x-[25%] 2xl:translate-y-[15%]">
          <AboutGraphic3 className="h-36 w-36 md:h-52 md:w-52 lg:h-56 lg:w-56 xl:h-80 xl:w-80 2xl:h-96 2xl:w-96" />
        </div>

        <p className="font-montserrat text-2xl font-semibold leading-relaxed md:max-w-[85%] 2xl:max-w-[70%]">
          Your donation today will bring the arts to more children and help them
          become creative and empathic
        </p>
        <div className="mt-6 flex flex-row justify-center gap-8 md:justify-start">
          {/* <Button
            variant="secondary"
            className="h-12 w-40 rounded-full font-sans text-base font-semibold lg:h-14 lg:w-36 2xl:text-xl"
          >
            Donate
          </Button> */}
          <DonateButton
            title="Donate"
            className="h-12 w-40 rounded-full font-sans text-base font-semibold lg:h-14 lg:w-36 2xl:text-xl"
          />
          <Button className="h-12 w-40 rounded-full font-sans text-base lg:h-14 lg:w-36 2xl:text-xl">
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}
