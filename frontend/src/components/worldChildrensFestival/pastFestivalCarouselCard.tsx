import { PastFestivalsData } from '@/data/wcf/pastFestivals';
import { VideoWrapper } from '../shared/VideoWrapper';
import type { VideoHandle } from '../shared/VideoWrapper';
import { FlairColorMap } from '../shared/FlairColorMap';

interface PastFestivalsCarouselCardProps {
  item: PastFestivalsData;
  videoRef?: (handle: VideoHandle | null) => void;
}

export default function PastFestivalsCarouselCard({
  item,
  videoRef,
}: PastFestivalsCarouselCardProps) {
  return (
    <div className="mb-4 grid grid-cols-12 gap-4 px-6 md:px-12 lg:px-16 xl:px-20">
      {/*Video */}
      <div className="col-span-12 h-48 rounded-xl sm:h-[365px] lg:col-span-9 lg:row-span-1 lg:h-[330px] xl:h-[410px] 2xl:h-[500px]">
        <VideoWrapper
          videoRef={videoRef}
          src={item.videoSrc}
          thumbnail={item.thumbSrc}
          className="h-full w-full object-cover"
        />
      </div>
      {/*Text Card */}
      <div
        className={`col-span-7 ${FlairColorMap[item.color].border} h-48 rounded-xl border-4 p-2 sm:col-span-9 md:flex md:h-64 md:flex-col md:items-start md:justify-center md:gap-8 md:p-8 lg:col-span-12 lg:row-start-2 lg:h-28 lg:gap-4 xl:h-32`}
      >
        <div className="font-montserrat text-base font-extrabold">
          {item.title}
        </div>
        <p className="font-sans text-base font-normal">{item.paragraph}</p>
      </div>
      {/*Image Card */}
      <div className="col-span-5 h-48 rounded-xl sm:col-span-3 md:h-64 lg:col-span-3 lg:row-span-1 lg:h-[330px] xl:h-[410px] 2xl:h-[500px]">
        <img
          className="h-full w-full rounded-xl object-cover"
          loading="lazy"
          src={item.magazineCover}
        />
      </div>
    </div>
  );
}
