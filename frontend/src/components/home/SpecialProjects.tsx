import { Button } from '../ui/button';
import { specialProjectData } from '@/data/home/homeSpecialProjects';
import { ProjectWindows } from './ProjectWindows';
import Firework from '@/assets/impact/Firework.webp';
import Ribbons from '@/assets/home/Ribbons.svg';
import smallBlueFirework from '@/assets/home/SmallBlueFirework.svg';
import { Link } from 'react-router-dom';

export const SpecialProjects = () => {
  return (
    <div className="relative flex flex-col gap-28">
      <div className="relative z-10 flex flex-col gap-10 px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="absolute inset-x-0 -top-8 flex justify-center gap-[500px] md:gap-[600px]">
          <img className="" src={smallBlueFirework} alt="" />

          <img className="" src={smallBlueFirework} alt="" />
        </div>
        <h2 className="font-montserrat text-center text-[32px] font-extrabold md:text-[40px]">
          Special Project Websites
        </h2>
        <div>
          <ProjectWindows windowArray={specialProjectData} />
        </div>
      </div>
      <div className="relative z-10 px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="relative max-w-screen-2xl gap-8 overflow-clip">
          <div className="relative z-10 rounded-xl bg-[#dfe7f8] p-10 sm:py-8 md:py-12 lg:py-16 xl:py-24">
            {' '}
            <p className="font-montserrat mb-8 text-2xl font-semibold sm:max-w-[75%]">
              Let us join hands to make our world more humane.
            </p>
            <div className="inline-grid grid-cols-2 gap-2">
              <Link to="/donate">
                <Button
                  asChild
                  className="bg-secondary-yellow w-auto rounded-full p-6 px-8 text-lg font-semibold text-black"
                  variant={'secondary'}
                >
                  <p className="">Donate</p>
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  asChild
                  className="rounded-full p-6 text-lg font-semibold"
                  variant="default"
                >
                  <p>Contact Us</p>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <img
        src={Firework}
        className="absolute -right-36 bottom-24 z-0 scale-50 sm:-right-24 sm:bottom-0 sm:z-20 md:-right-16 md:scale-[60%] lg:-right-4 lg:scale-75 xl:right-0 xl:scale-100"
        alt=""
      />
      <div className="absolute origin-[10%_90%] rotate-[80deg] overflow-hidden sm:origin-[10%_100%] md:-bottom-20 md:-right-20 md:w-[1500px] md:origin-[0%_0%] md:rotate-[0deg]">
        <img className="min-w-[900px]" src={Ribbons} />
      </div>
    </div>
  );
};
