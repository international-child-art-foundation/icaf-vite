import { FutureWithoutHate } from '@/components/peaceThroughArt/FutureWithoutHate';
import { PTAHeader } from '@/components/peaceThroughArt/PTAHeader';
import { UrgencyOfPeace } from '@/components/peaceThroughArt/UrgencyOfPeace';
import { PeacefulFutureCTA } from '@/components/peaceThroughArt/PeacefulFutureCTA';
import { YoungArtistCarousel } from '@/components/peaceThroughArt/YoungArtistCarousel';

import { PTALearnMore } from '@/components/peaceThroughArt/PTALearnMore';

export const PeaceThroughArt = () => {
  return (
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
  );
};
