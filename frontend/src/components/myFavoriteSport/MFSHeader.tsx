import { CurvedImage } from '@/pages/CurvedImage';
import { OpinionatedGradients } from '@/data/gradientDefinition';
import ArtsOlympiadHeaderImg from '@/assets/arts-olympiad/Arjaa Raghu (age 11) Illinois, USA 6.webp';

import { useWindowSize } from 'usehooks-ts';

export const MFSHeader = () => {
  const size = useWindowSize();
  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = OpinionatedGradients.xl;
  } else if (size.width >= 1024) {
    gradientDefinition = OpinionatedGradients.lg;
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.15)_80%,rgba(255,255,255,0.15)_100%)]';
  } else {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.15)_80%,rgba(255,255,255,0.15)_100%)]';
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat max-w-screen-3xl z-10 col-start-1 row-start-1 flex flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-10 sm:px-8 md:mt-8 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
          <p>Arts Olympiad</p>
        </div>
        <p className="font-openSans text-xl font-normal text-white lg:max-w-[50%] xl:max-w-[38%]">
          The Arts Olympiad is an international art competition for children all
          over the world.
        </p>
        <p className="font-openSans text-xl font-normal text-white lg:max-w-[50%] xl:max-w-[38%]">
          Anyone aged 8 to 20 can create art about their favorite sport, upload
          it, and share it with family and friends to get their votes.
        </p>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={ArtsOlympiadHeaderImg}
          height={'600px'}
          objectFit="cover"
          objectPosition="center center"
        />
      </div>
    </div>
  );
};
