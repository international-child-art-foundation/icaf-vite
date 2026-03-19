import { CurvedImage } from '@/pages/CurvedImage';
import leadershipHeaderImg from '@/assets/shared/images/icafGroupPhoto.webp';

import { useWindowSize } from 'usehooks-ts';

export const LeadershipHeader = () => {
  const size = useWindowSize();
  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.5)_55%,rgba(0,0,0,0.1)_80%,rgba(255,255,255,0.1)_100%)]';
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.1)_80%,rgba(255,255,255,0.1)_100%)]';
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_100%)]';
  } else {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_100%)]';
  }

  return (
    <div className="site-w grid grid-cols-1 grid-rows-1">
      <div className="hero-w font-montserrat sm:mt-none z-10 col-start-1 row-start-1 mt-32 flex flex-col gap-2 pt-6 text-3xl font-extrabold text-white sm:gap-4 sm:pt-10 md:mt-8 md:text-4xl lg:mt-28 lg:text-6xl">
        <div className="font-montserrat block text-[30px] leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
          <h1 className="text-tertiary-yellow">Global Leaders</h1>
          <h1 className="lg:text-[48px] lg:leading-[58px]">Guiding Our Mission</h1>
        </div>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={leadershipHeaderImg}
          height={'600px'}
          objectFit="cover"
          objectPosition="center right"
        />
      </div>
    </div>
  );
};
