import { Button } from '../ui/button';
import Girl from '@/assets/worldChildrensFestival/girlPaintHands.webp';

export default function WCFCTA() {
  return (
    <section className="my-16 px-6 md:mt-32 md:px-12 lg:px-16 xl:mb-20 xl:mt-40 xl:px-20">
      <div className="relative flex h-[400px] items-center rounded-3xl bg-[#2057CC24] xl:h-[475px]">
        {/**Content Container */}
        <div className="flex flex-col px-8 lg:px-14 xl:px-16">
          <h2 className="font-montserrat z-10 mb-2 text-3xl font-extrabold lg:text-[40px]">
            Be Part of the Movement
          </h2>
          <p className="my-4 font-sans text-xl font-normal md:max-w-[50%] lg:max-w-[60%] xl:text-2xl">
            {' '}
            The 7th World Children’s Festival is scheduled for July 25–July 27,
            2026. Join the children at the National Mall across the U.S. Capitol
            or support them with you donation today.
          </p>
          <a
            href="https://worldchildrensfestival.org/"
            target="blank"
            rel="noopener noreferrer"
            className="mr-auto"
          >
            <Button
              variant="secondary"
              className="h-12 w-[160px] rounded-full text-base font-semibold lg:w-[170px] xl:h-14 xl:w-[200px]"
            >
              Get Involved
            </Button>
          </a>
        </div>
        {/*Girl Image*/}
        <div className="absolute -right-32 hidden md:block">
          <img
            src={Girl}
            loading="lazy"
            className="h-[650px] w-[550px] xl:h-[740px] xl:w-[630px] 2xl:h-[830px] 2xl:w-[700px]"
          />
        </div>
      </div>
    </section>
  );
}
