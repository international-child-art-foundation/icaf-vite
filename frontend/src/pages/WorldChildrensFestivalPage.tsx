import FestivalHighlights from '@/components/worldChildrensFestival/festivalHighlights';
import OurLegacy from '@/components/worldChildrensFestival/ourLegacy';
import PastFestivalsCarousel from '@/components/worldChildrensFestival/pastFestivalsCarousel';
import WCFHeader from '@/components/worldChildrensFestival/wcfHeader';
import WFCCTA from '@/components/worldChildrensFestival/wfcCTA';

export default function WorldChildrensFestival() {
  return (
    <div className="overflow-hidden">
      <WCFHeader />
      <FestivalHighlights />
      <OurLegacy />
      <PastFestivalsCarousel />
      <WFCCTA />
    </div>
  );
}
