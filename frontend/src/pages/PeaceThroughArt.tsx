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
      <div className="content-gap relative">
        <PTAHeader />
        <UrgencyOfPeace />
        <FutureWithoutHate />
        <PeacefulFutureCTA />
        <YoungArtistCarousel />
        <div className="relative z-20">
          <PTALearnMore />
        </div>
      </div>
    </>
  );
};
