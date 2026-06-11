import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import HomeHeader from '@/modules/content/components/home/HomeHeader';
import { Activities } from '@/modules/content/components/home/Activities';
import { HomeImpact } from '@/modules/content/components/home/HomeImpact';
import MissionVision from '@/modules/content/components/home/MissionVision';
import WhatWeDo from '@/modules/content/components/home/WhatWeDo';
import { bannerItems } from '@/modules/content/data/home/homeBannerImages';
import { BannerImageCarousel } from '@/modules/content/components/home/BannerImageCarousel';
import { HomeActivities } from '@/modules/content/data/home/homeActivitySection';
import { Seo } from '@/modules/content/components/shared/Seo';
import { NewsletterSignup } from '@/modules/content/components/home/NewsletterSignup';
import { SpecialProjects } from '@/modules/content/components/home/SpecialProjects';

const HomeCarousel = lazy(() =>
  import('@/modules/content/components/home/HomeCarousel').then((m) => ({
    default: m.HomeCarousel,
  })),
);

function HomeCarouselWhenVisible() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldLoad) return;

    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      {
        rootMargin: '500px 0px',
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="min-h-[420px]">
      {shouldLoad && (
        <Suspense fallback={null}>
          <HomeCarousel />
        </Suspense>
      )}
    </div>
  );
}

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
        <HomeCarouselWhenVisible />
      </div>
    </>
  );
}
