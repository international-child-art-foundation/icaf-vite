import FestivalHighlights from '@/components/worldChildrensFestival/festivalHighlights';
import OurLegacy from '@/components/worldChildrensFestival/ourLegacy';
import WCFHeader from '@/components/worldChildrensFestival/WCFHeader';

export default function WorldChildrensFestival() {
  return (
    <div className="">
      <WCFHeader />
      <FestivalHighlights />
      <OurLegacy />
      <div className=""></div>
    </div>
  );
}
