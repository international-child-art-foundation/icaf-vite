import { IicafTimelineData } from '@/types/HistoryTypes';
import { TimelineSide } from './TimelineSide';
import { icafTimelineData } from '@/data/history/icafTimelineData';

export const HistoryTimeline = () => {
  // TODO: Actually separate data into two variables
  const leftTimeline: IicafTimelineData[] = icafTimelineData;
  const rightTimeline: IicafTimelineData[] = icafTimelineData;
  return (
    <div className="flex flex-col gap-20">
      <div className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
        ICAF Timeline
      </div>
      <div className="mx-auto flex flex-col items-center">
        <div className="bg-tertiary-red h-7 w-7 rounded-full"></div>
        <div className="bg-tertiary-red h-24 w-1"></div>
        <div className="gris-cols-1 grid grid-rows-1">
          <TimelineSide
            side={'left'}
            data={leftTimeline}
            className="col-start-1 row-start-1"
          />
          <TimelineSide
            side={'right'}
            data={rightTimeline}
            className="col-start-1 row-start-1"
          />
        </div>
      </div>
    </div>
  );
};
