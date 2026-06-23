import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { FutureWithoutHate } from '@/modules/content/components/peaceThroughArt/FutureWithoutHate';
import { PTAHeader } from '@/modules/content/components/peaceThroughArt/PTAHeader';
import { UrgencyOfPeace } from '@/modules/content/components/peaceThroughArt/UrgencyOfPeace';
import { PeacefulFutureCTA } from '@/modules/content/components/peaceThroughArt/PeacefulFutureCTA';
import { YoungArtistCarousel } from '@/modules/content/components/peaceThroughArt/YoungArtistCarousel';

import { PTALearnMore } from '@/modules/content/components/peaceThroughArt/PTALearnMore';
import { Seo } from '@/modules/content/components/shared/Seo';

const peaceThroughArtMetadata = {
  title: "Peace Through Art — ICAF's Program for Global Understanding",
  description:
    "ICAF's Peace Through Art program uses creative expression to build empathy and cross-cultural understanding among children and communities worldwide.",
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
      <PageBottomSpacer />
    </>
  );
};
