import { CurvedImage } from '@/pages/CurvedImage';
import { unitedStatesSLKorth } from '@/assets/shared/images/about';

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
    <div className="site-w grid grid-cols-1 grid-rows-1">
      <div className="hero-w font-montserrat sm:mt-none z-10 col-start-1 row-start-1 mt-32 flex flex-col gap-2 pt-6 text-3xl font-extrabold text-white sm:gap-4 sm:pt-0 md:mt-12 md:text-4xl lg:mt-28 lg:text-6xl">
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
          src={unitedStatesSLKorth}
          height={'600px'}
          objectFit="cover"
          objectPosition="center right"
        />
      </div>
    </div>
  );
};
