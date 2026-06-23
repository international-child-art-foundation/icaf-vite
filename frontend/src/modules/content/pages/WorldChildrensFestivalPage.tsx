import FestivalHighlights from '@/modules/content/components/worldChildrensFestival/festivalHighlights';
import OurLegacy from '@/modules/content/components/worldChildrensFestival/ourLegacy';
import PastFestivalsCarousel from '@/modules/content/components/worldChildrensFestival/pastFestivalsCarousel';
import WCFHeader from '@/modules/content/components/worldChildrensFestival/WCFHeader';
import WCFCTA from '@/modules/content/components/worldChildrensFestival/WCFCTA';
import { Seo } from '@/modules/content/components/shared/Seo';

const WCFMetadata = {
  title:
    "World Children's Festival — A Global Celebration of Young Artists",
  description:
    "The World Children's Festival brings young artists from around the world together to celebrate creativity, cultural exchange, and the power of the arts.",
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
