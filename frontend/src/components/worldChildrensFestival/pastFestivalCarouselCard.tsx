import { PastFestivalsData } from '@/lib/pastFestivals';
import VideoPlayer from '../about/VideoPlayer';

/**
 * Note: VideoPlayer component is awaiting Src/poster properties.  When those are provided they need to be added to the pastFestivalData, update typechecks, update VideoPlayer props, then remove temporary bg-gray-500 from parent div.
 */

interface PastFestivalsCarouselCardProps {
  item: PastFestivalsData;
}

export default function PastFestivalsCarouselCard({
  item,
}: PastFestivalsCarouselCardProps) {
  return (
    <div className="mb-4 grid grid-cols-12 gap-4 px-6 md:px-12 lg:px-16 xl:px-20">
      {/*Video */}
      <div className="col-span-12 h-48 rounded-xl bg-gray-500 sm:h-[365px] lg:col-span-9 lg:row-span-1 lg:h-[330px] xl:h-[410px] 2xl:h-[500px]">
        <VideoPlayer src="" poster="" className="h-full w-full object-cover" />
      </div>
      {/*Text Card */}
      <div
        className="col-span-7 h-48 rounded-xl border-4 p-2 sm:col-span-9 md:flex md:h-64 md:flex-col md:items-start md:justify-center md:gap-8 md:p-8 lg:col-span-12 lg:row-start-2 lg:h-28 lg:gap-4 xl:h-32"
        style={{ borderColor: item.color }}
      >
        <div className="font-montserrat text-base font-extrabold">
          {item.title}
        </div>
        <p className="font-sans text-base font-normal">{item.paragraph}</p>
      </div>
      {/*Image Card */}
      <div className="col-span-5 h-48 rounded-xl sm:col-span-3 md:h-64 lg:col-span-3 lg:row-span-1 lg:h-[330px] xl:h-[410px] 2xl:h-[500px]">
        <img className="h-full w-full rounded-xl object-cover" src={item.src} />
      </div>
    </div>
  );
}
