import HomeHeader from '@/components/home/HomeHeader';
import { Activities } from '@/components/home/Activities';
import { HomeImpact } from '@/components/home/HomeImpact';

import MissionVision from '@/components/home/MissionVision';
import WhatWeDo from '@/components/home/WhatWeDo';
import { bannerItems } from '@/data/home/homeBannerImages';
import { BannerImageCarousel } from '@/components/home/BannerImageCarousel';
import { HomeActivities } from '@/data/home/homeActivitySection';

export default function Home() {
  return (
    <div className="m-0 flex w-full flex-col items-center gap-4 p-0">
      <HomeHeader />
      <MissionVision />
      <BannerImageCarousel items={bannerItems} displayMs={2000} />
      <WhatWeDo />
      <Activities activityPairs={HomeActivities} />
      <HomeImpact />
    </div>
  );
}
