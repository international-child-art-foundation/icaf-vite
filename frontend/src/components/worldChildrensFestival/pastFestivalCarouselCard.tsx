import { PastFestivalsData } from '@/lib/pastFestivals';
import VideoPlayer from '../about/VideoPlayer';

/**
 * Note: VideoPlayer component is awaiting and Src/ poster.  When those are provided they need to be added to the pastFestivalData, update typechecks, update VideoPlayer props, then remove temporary bg-gray-500 from parent div.
 */

interface PastFestivalsCarouselCardProps {
  item: PastFestivalsData;
}

export default function PastFestivalsCarouselCard({
  item,
}: PastFestivalsCarouselCardProps) {
  return (
    <div className="mx-4 mb-4 grid grid-cols-12 gap-4">
      {/*Video */}
      <div className="col-span-12 h-48 rounded-xl bg-gray-500">
        <VideoPlayer src="" poster="" className="h-full w-full object-cover" />
      </div>
      {/*Text Card */}
      <div
        className="col-span-7 h-48 rounded-xl border-4 p-2"
        style={{ borderColor: item.color }}
      >
        <div className="font-montserrat text-base font-extrabold">
          {item.title}
        </div>
        <p className="font-sans text-base font-normal">{item.paragraph}</p>
      </div>
      {/*Image Card */}
      <div className="col-span-5 h-48 rounded-xl">
        <img className="h-full w-full rounded-xl object-cover" src={item.src} />
      </div>
    </div>
  );
}
