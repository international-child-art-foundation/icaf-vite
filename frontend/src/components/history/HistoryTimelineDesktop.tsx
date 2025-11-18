import { TimelineSideDesktop } from './TimelineSideDesktop';
import { icafTimelineData } from '@/data/history/icafTimelineData';
import threeLines from '@/assets/history/ThreeLines.svg';
import redBlueFirework from '@/assets/home/RedBlueFirework.svg';
import pinkPuddle from '@/assets/shared/svg-arg/PuddleBackground.svg';
import bluePuddle from '@/assets/shared/svg-arg/PuddleBackgroundLarge.svg';
import yellowPuddle from '@/assets/shared/svg-arg/PuddleBackgroundLargest.svg';
import smallYellowPuddle from '@/assets/shared/svg-arg/PuddleBackgroundSmall.svg';

export const HistoryTimelineDesktop = () => {
  const TIMELINE_WIDTH = 500;
  return (
    <div className="relative grid grid-cols-1 grid-rows-1 md:pb-80 xl:pb-96">
      <div className="z-10 col-start-1 row-start-1 flex flex-col gap-20">
        <div className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          ICAF Timeline
        </div>
        <div className={`mx-auto flex w-full flex-col items-center`}>
          <div className="bg-tertiary-red h-7 w-7 rounded-full"></div>
          <div className="bg-tertiary-red h-24 w-1"></div>
          <div className="gris-cols-1 -mt-10 grid w-full grid-rows-1">
            <TimelineSideDesktop
              side={'left'}
              data={icafTimelineData}
              className="col-start-1 row-start-1 place-self-center"
              width={TIMELINE_WIDTH}
            />
            <TimelineSideDesktop
              side={'right'}
              data={icafTimelineData}
              className="col-start-1 row-start-1 place-self-center"
              width={TIMELINE_WIDTH}
            />
          </div>
        </div>
      </div>
      <div className="relative col-start-1 row-start-1 w-full">
        <img src={pinkPuddle} className="absolute right-0 top-[10%]" />
        <img src={bluePuddle} className="absolute -left-48 top-[23%]" />
        <img src={yellowPuddle} className="absolute -right-48 top-[65%] z-0" />
        <img src={smallYellowPuddle} className="absolute right-96 top-[64%]" />
        <img
          src={redBlueFirework}
          className="absolute -left-12 object-cover opacity-[20%]"
        />
        <img
          src={redBlueFirework}
          className="absolute -left-12 top-[70%] w-[500px] object-cover opacity-[15%]"
        />
        <img
          src={redBlueFirework}
          className="absolute bottom-[9%] right-40 w-[200px] object-cover opacity-[20%]"
        />
        <img
          src={threeLines}
          className="absolute w-full object-cover md:-bottom-80 xl:-bottom-96"
        />
      </div>
    </div>
  );
};
