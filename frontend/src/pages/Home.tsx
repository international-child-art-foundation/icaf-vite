import HomeHeader from '@/components/home/HomeHeader';

import MissionVision from '@/components/home/MissionVision';
import WhatWeDo from '@/components/home/WhatWeDo';
import { bannerItems } from '@/data/homeBannerImages';
import { BannerImageCarousel } from '@/components/home/BannerImageCarousel';

export default function Home() {
  return (
    <div className="m-0 flex w-full flex-col items-center p-0">
      <HomeHeader />
      <MissionVision />
      <BannerImageCarousel items={bannerItems} displayMs={2000} />
      <WhatWeDo />
    </div>
  );
}
