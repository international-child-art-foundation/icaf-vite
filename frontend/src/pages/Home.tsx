import {
  girlWithFlag1536,
  girlWithFlag768,
  girlWithFlag428,
} from '@/assets/shared/images/home/girl-with-flag';
import HomeHeader from '@/components/home/HomeHeader';

import MissionVision from '@/components/home/MissionVision';
import WhatWeDo from '@/components/home/WhatWeDo';

export default function Home() {
  return (
    <div className="m-0 flex w-full flex-col items-center p-0">
      <HomeHeader />
      <MissionVision />
      <div className="w-full">
        <picture>
          <source media="(min-width: 1024px)" srcSet={girlWithFlag1536} />
          <source media="(min-width: 768px)" srcSet={girlWithFlag768} />
          <source media="(max-width: 767px)" srcSet={girlWithFlag428} />
          <img
            src={girlWithFlag1536}
            alt="Girl holding flag"
            className="h-[443px] w-full md:h-[495px] lg:h-[725px] 2xl:h-[824px]"
            loading="lazy"
          />
        </picture>
      </div>
      <WhatWeDo />
    </div>
  );
}
