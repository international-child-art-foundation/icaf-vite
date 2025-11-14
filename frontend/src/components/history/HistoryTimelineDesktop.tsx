import { TimelineSideDesktop } from './TimelineSideDesktop';
import { icafTimelineData } from '@/data/history/icafTimelineData';

export const HistoryTimelineDesktop = () => {
  const TIMELINE_WIDTH = 500;
  return (
    <div className="flex flex-col gap-20">
      <div className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
        ICAF Timeline
      </div>
      <div
        className={`mx-auto flex flex-col items-center`}
        style={{ width: TIMELINE_WIDTH }}
      >
        <div className="bg-tertiary-red h-7 w-7 rounded-full"></div>
        <div className="bg-tertiary-red h-24 w-1"></div>
        <div className="gris-cols-1 -mt-10 grid grid-rows-1">
          <TimelineSideDesktop
            side={'left'}
            data={icafTimelineData}
            className="col-start-1 row-start-1"
            width={TIMELINE_WIDTH}
          />
          <TimelineSideDesktop
            side={'right'}
            data={icafTimelineData}
            className="col-start-1 row-start-1"
            width={TIMELINE_WIDTH}
          />
        </div>
      </div>
    </div>
  );
};
