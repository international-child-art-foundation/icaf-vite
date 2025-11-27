import { FutureWithoutHate } from '@/components/peaceThroughArt/FutureWithoutHate';
import { PTAHeader } from '@/components/peaceThroughArt/PTAHeader';
import { UrgencyOfPeace } from '@/components/peaceThroughArt/UrgencyOfPeace';
import { PeacefulFutureCTA } from '@/components/peaceThroughArt/PeacefulFutureCTA';
import { YoungArtistCarousel } from '@/components/peaceThroughArt/YoungArtistCarousel';

import { PTALearnMore } from '@/components/peaceThroughArt/PTALearnMore';
import { Seo } from '@/components/shared/Seo';

const peaceThroughArtMetadata = {
  title: 'Peace Through Art | ICAF',
  description:
    "ICAF's Peace Through Art initiative deploys creativity to inspire mutual empathy and break cycles of trauma.",
  path: '/programs/peace-through-art',
};

export const PeaceThroughArt = () => {
  return (
    <>
      <Seo {...peaceThroughArtMetadata} />
      <div>
        <div className="relative">
          <PTAHeader />
          <div className="flex max-w-screen-2xl flex-col gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
            <UrgencyOfPeace />
          </div>{' '}
          <FutureWithoutHate />
          <PeacefulFutureCTA />
          <div className="relative z-0">
            <YoungArtistCarousel />
          </div>
          <div className="relative z-20">
            <PTALearnMore />
          </div>
        </div>
      </div>
    </>
  );
};
