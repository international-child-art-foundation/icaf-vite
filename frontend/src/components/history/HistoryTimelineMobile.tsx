import { icafTimelineData } from '@/data/history/icafTimelineData';
import { TimelineEventMobile } from './TimelineEventMobile';

export const HistoryTimelineMobile = () => {
  return (
    <div className="flex flex-col gap-20">
      <div className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
        ICAF Timeline
      </div>
      <div className={`flex max-w-screen-2xl flex-col`}>
        <div className="bg-tertiary-red -ml-3 h-7 w-7 rounded-full"></div>
        <div className="bg-tertiary-red h-24 w-1"></div>
        <div className="gris-cols-1 -mt-10 grid grid-rows-1">
          {icafTimelineData.map((event) => (
            <TimelineEventMobile key={event.title} {...event} />
          ))}
        </div>
      </div>
    </div>
  );
};
