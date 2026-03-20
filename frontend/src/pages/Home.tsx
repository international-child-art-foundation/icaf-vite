import HomeHeader from '@/components/home/HomeHeader';
import { Activities } from '@/components/home/Activities';
import { HomeImpact } from '@/components/home/HomeImpact';
import MissionVision from '@/components/home/MissionVision';
import WhatWeDo from '@/components/home/WhatWeDo';
import { bannerItems } from '@/data/home/homeBannerImages';
import { BannerImageCarousel } from '@/components/home/BannerImageCarousel';
import { HomeActivities } from '@/data/home/homeActivitySection';
import { HomeCarousel } from '@/components/home/HomeCarousel';
import { Seo } from '@/components/shared/Seo';
import { NewsletterSignup } from '@/components/home/NewsletterSignup';
import { SpecialProjects } from '@/components/home/SpecialProjects';

const homeMetadata = {
  title: 'Home | ICAF',
  description:
    'The International Child Art Foundation (ICAF) empowers children worldwide through art, creativity, and empathy-building programs.',
  path: '/',
};

export default function Home() {
  return (
    <>
      <Seo {...homeMetadata} />
      <div className="content-gap relative">
        <HomeHeader />
        <MissionVision />
        <BannerImageCarousel items={bannerItems} displayMs={3000} />
        <WhatWeDo />
        <Activities activityPairs={HomeActivities} />
        <HomeImpact />
        <SpecialProjects />
        <NewsletterSignup />
        <HomeCarousel />
      </div>
    </>
  );
}
