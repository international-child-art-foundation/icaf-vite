import HomeHeader from '@/components/home/HomeHeader';
import { Activities } from '@/components/home/Activities';
import { HomeImpact } from '@/components/home/HomeImpact';

import MissionVision from '@/components/home/MissionVision';
import WhatWeDo from '@/components/home/WhatWeDo';
import { bannerItems } from '@/data/home/homeBannerImages';
import { BannerImageCarousel } from '@/components/home/BannerImageCarousel';
import { HomeActivities } from '@/data/home/homeActivitySection';
import { SpecialProjects } from '@/components/home/SpecialProjects';
import { HomeCarousel } from '@/components/home/HomeCarousel';

export default function Home() {
  return (
    <div className="relative m-0 flex w-full flex-col items-center gap-12 overflow-hidden p-0">
      <HomeHeader />
      <MissionVision />
      <BannerImageCarousel items={bannerItems} displayMs={2000} />
      <WhatWeDo />
      <Activities activityPairs={HomeActivities} />
      <HomeImpact />
      <SpecialProjects />
      <HomeCarousel />
    </div>
  );
}
