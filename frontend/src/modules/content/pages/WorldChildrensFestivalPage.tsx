import FestivalHighlights from '@/modules/content/components/worldChildrensFestival/festivalHighlights';
import OurLegacy from '@/modules/content/components/worldChildrensFestival/ourLegacy';
import PastFestivalsCarousel from '@/modules/content/components/worldChildrensFestival/pastFestivalsCarousel';
import WCFHeader from '@/modules/content/components/worldChildrensFestival/WCFHeader';
import WCFCTA from '@/modules/content/components/worldChildrensFestival/WCFCTA';
import { Seo } from '@/modules/content/components/shared/Seo';

const WCFMetadata = {
  title: "World Children's Festival | ICAF",
  description:
    'The World Children’s Festival brings together young creators from around the globe to celebrate imagination, share cultures, and show how creativity can shape a brighter future.',
  path: '/programs/world-childrens-festival',
};

export default function WorldChildrensFestival() {
  return (
    <>
      <Seo {...WCFMetadata} />
      <div className="content-gap overflow-hidden">
        <WCFHeader />
        <FestivalHighlights />
        <OurLegacy />
        <PastFestivalsCarousel />
        <WCFCTA />
      </div>
    </>
  );
}
