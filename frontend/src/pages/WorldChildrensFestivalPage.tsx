import FestivalHighlights from '@/components/worldChildrensFestival/festivalHighlights';
import OurLegacy from '@/components/worldChildrensFestival/ourLegacy';
import PastFestivalsCarousel from '@/components/worldChildrensFestival/pastFestivalsCarousel';
import WCFHeader from '@/components/worldChildrensFestival/WCFHeader';
import WCFCTA from '@/components/worldChildrensFestival/WCFCTA';
import { Seo } from '@/components/shared/Seo';

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
      <div className="overflow-hidden">
        <WCFHeader />
        <FestivalHighlights />
        <OurLegacy />
        <PastFestivalsCarousel />
        <WCFCTA />
      </div>
    </>
  );
}
