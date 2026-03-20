import { CurvedImage } from '@/pages/CurvedImage';
import { teamHeader } from '@/assets/shared/images';
import { ArrowDown } from 'lucide-react';
import { useWindowSize } from 'usehooks-ts';

interface TeamHeaderProps {
  scrollFunction: () => void;
}

const TeamHeader = ({ scrollFunction }: TeamHeaderProps) => {
  const size = useWindowSize();

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.05)_22%,rgba(0,0,0,0.55)_35%,rgba(0,0,0,0.84)_74%,rgba(0,0,0,1)_85%)]';
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.05)_22%,rgba(0,0,0,0.57)_35%,rgba(0,0,0,0.84)_74%,rgba(0,0,0,1)_85%)]';
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.05)_22%,rgba(0,0,0,0.57)_35%,rgba(0,0,0,0.84)_74%,rgba(0,0,0,1)_85%)]';
  } else {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.05)_22%,rgba(0,0,0,0.57)_35%,rgba(0,0,0,0.84)_74%,rgba(0,0,0,1)_85%)]';
  }

  return (
    <div className="site-w grid grid-cols-1 grid-rows-1">
      <div className="hero-w font-montserrat z-10 col-start-1 row-start-1 mt-44 flex flex-col gap-4 pt-10 text-3xl font-extrabold text-white md:mt-44 md:text-4xl lg:mt-44 lg:text-6xl">
        <div className="flex flex-col gap-0 text-left md:gap-4 md:text-center">
          <h1 className="text-[#FFD743]">Meet the People</h1>
          <h1>Behind ICAF's Mission</h1>
        </div>
        <p className="font-openSans mx-auto text-left text-lg font-normal text-white md:max-w-[70%] 2xl:max-w-[50%]">
          Our leadership and team are dedicated to inspiring children through
          creativity. From strategic direction to hands-on program execution,
          they bring ICAF’s vision to life.
        </p>
        <div
          className="transition-color mx-auto mt-0 flex h-[50px] w-[50px] cursor-pointer items-center rounded-full border-2 border-[#FFD743] text-center duration-300 hover:bg-black sm:mt-8 md:mt-4 lg:mt-2 xl:mt-8"
          onClick={scrollFunction}
        >
          <ArrowDown className="mx-auto" />
        </div>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={teamHeader}
          height={'700px'}
          objectFit="cover"
          objectPosition="center top"
        />
      </div>
    </div>
  );
};

export default TeamHeader;
