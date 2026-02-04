import { CurvedImage } from '@/pages/CurvedImage';
import researchAndPublicationsHeader from '@/assets/shared/images/about/UnitedStatesSLKorth.webp';

import { useWindowSize } from 'usehooks-ts';

export const ResearchAndPublicationsHeader = () => {
  const size = useWindowSize();
  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.2)_100%)]';
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.2)_100%)]';
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_100%)]';
  } else {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_100%)]';
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat sm:mt-none max-w-screen-3xl z-10 col-start-1 row-start-1 mt-32 flex flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-0 sm:px-8 md:mt-12 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[40px] leading-[60px] sm:text-[50px] sm:leading-[60px] md:text-[60px] md:leading-[70px]">
          <h1 className="text-tertiary-yellow">Research and Publications</h1>
          <h3 className="font-montserrat block text-[25px] font-bold leading-[35px] sm:text-[25px] sm:leading-[45px] md:text-[35px] md:leading-[50px]">
            Helping children write the future
          </h3>
        </div>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={researchAndPublicationsHeader}
          height={'600px'}
          objectFit="cover"
          objectPosition="center right"
        />
      </div>
    </div>
  );
};
