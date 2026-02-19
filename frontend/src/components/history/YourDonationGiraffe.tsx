import { Button } from '../ui/button';
import DonateButtonPure from '../ui/donateButtonPure';
import giraffeGroup from '@/assets/history/GiraffeGroup.webp';
import { Link } from 'react-router-dom';

export const YourDonationGiraffe = () => {
  return (
    <div className="overflow-x-hidden py-16">
      <section className="mb-24 max-w-screen-2xl">
        <div className="relative flex h-[332px] w-full flex-col justify-center overflow-visible rounded-2xl bg-[#E0E8F8] px-6 text-center md:h-[300px] md:px-12 md:text-left lg:h-[320px] xl:h-[340px] 2xl:h-[400px]">
          {/* Graphic wrapper to prevent scroll pushing */}
          <div className="pointer-events-none absolute inset-0 overflow-visible">
            <div className="absolute right-0 top-0 z-[10] translate-x-[-10%] translate-y-[10%]">
              <img
                src={giraffeGroup}
                className="hidden w-[300px] md:block xl:w-[450px]"
              />
            </div>
          </div>

          <p className="font-montserrat text-2xl font-semibold leading-relaxed md:max-w-[70%] 2xl:max-w-[70%]">
            Your donation today will bring the arts to more children and help
            them become creative and empathic.
          </p>
          <div className="mt-6 flex flex-row justify-center gap-8 md:justify-start">
            <DonateButtonPure className="h-12 min-w-28 max-w-40 rounded-full font-sans text-base font-semibold lg:h-14 lg:w-36 2xl:text-xl" />
            <Link to={'/get-involved/volunteers'}>
              <Button className="h-12 min-w-32 max-w-40 rounded-full font-sans text-base lg:h-14 lg:w-36 2xl:text-xl">
                Get Involved
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
