import { CurvedImage } from '@/pages/CurvedImage';
import TeamHeaderImg from '@/assets/team/TeamHeader.webp';
import { ArrowDown } from 'lucide-react';

const TeamHeader = () => {
  const gradientDefinition =
    'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0%,rgba(0,0,0,0.05)_22%,rgba(0,0,0,0.57)_45%,rgba(0,0,0,0.84)_74%,rgba(0,0,0,0.84)_100%)]';

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat z-10 col-start-1 row-start-1 mt-8 flex max-w-screen-2xl flex-col gap-4 p-10 px-8 text-3xl font-extrabold text-white md:mt-20 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-[#FFD743]">Meet the People</p>
          <p>Behind ICAF's Mission</p>
        </div>
        <p className="font-openSans mx-auto text-center text-lg font-normal text-white md:max-w-[50%]">
          Our leadership and team are dedicated to inspiring children through
          creativity. From strategic direction to hands-on program execution,
          they bring ICAF’s vision to life.
        </p>
        <div className="mx-auto mt-20 flex h-[50px] w-[50px] cursor-pointer items-center rounded-full border-2 border-[#FFD743] text-center">
          <ArrowDown className="mx-auto" />
        </div>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={TeamHeaderImg}
          height={'700px'}
          objectFit="cover"
          objectPosition="center top"
        />
      </div>
    </div>
  );
};

export default TeamHeader;
