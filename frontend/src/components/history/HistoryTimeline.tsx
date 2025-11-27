import { TimelineSideDesktop } from './TimelineSideDesktop';
import { icafTimelineData } from '@/data/history/icafTimelineData';
import threeLines from '@/assets/history/ThreeLines.svg';
import redBlueFirework from '@/assets/home/RedBlueFirework.svg';
import pinkPuddle from '@/assets/shared/svg-arg/PuddleBackground.svg';
import bluePuddle from '@/assets/shared/svg-arg/PuddleBackgroundLarge.svg';
import yellowPuddle from '@/assets/shared/svg-arg/PuddleBackgroundLargest.svg';
import smallYellowPuddle from '@/assets/shared/svg-arg/PuddleBackgroundSmall.svg';
import { TimelineEventMobile } from './TimelineEventMobile';

interface HistoryTimelineProps {
  mode: 'desktop' | 'mobile';
}

export const HistoryTimeline = ({ mode }: HistoryTimelineProps) => {
  const TIMELINE_WIDTH = 500;
  return (
    <div className="relative grid grid-cols-1 grid-rows-1 pb-40 lg:pb-80 xl:pb-96">
      <div className="z-10 col-start-1 row-start-1 flex flex-col gap-20">
        <h2 className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          ICAF Timeline
        </h2>
        {mode === 'desktop' ? (
          <div className={`mx-auto flex w-full flex-col items-center`}>
            <div className="bg-tertiary-red h-7 w-7 rounded-full"></div>
            <div className="bg-tertiary-red h-24 w-1"></div>
            <div className="gris-cols-1 -mt-10 grid w-full grid-rows-1">
              <>
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
              </>
            </div>
          </div>
        ) : (
          <div
            className={`flex max-w-screen-2xl flex-col px-8 md:px-12 lg:px-16 xl:px-20`}
          >
            <div className="bg-tertiary-red -ml-3 h-7 w-7 rounded-full"></div>
            <div className="bg-tertiary-red h-24 w-1"></div>
            <div className="gris-cols-1 -mt-10 grid grid-rows-1">
              {icafTimelineData.map((event) => (
                <TimelineEventMobile key={event.title} {...event} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="relative col-start-1 row-start-1 w-full">
        <img
          src={pinkPuddle}
          className="absolute right-0 top-[15%] lg:top-[10%]"
          alt=""
        />
        <img
          src={bluePuddle}
          className="absolute top-[25%] opacity-[70%] lg:-left-48 lg:top-[23%] lg:opacity-100"
          alt=""
        />
        <img
          src={yellowPuddle}
          className="absolute top-[55%] z-0 opacity-[60%] lg:-right-48 lg:top-[55%] lg:opacity-100"
          alt=""
        />
        <img
          src={smallYellowPuddle}
          className="absolute -right-24 top-[80%] lg:right-96 lg:top-[54%]"
          alt=""
        />
        <img
          src={redBlueFirework}
          className="absolute -right-12 top-24 opacity-[5%] lg:-left-12 lg:object-cover lg:opacity-[20%]"
          alt=""
        />
        <img
          src={redBlueFirework}
          className="absolute right-0 top-[42%] opacity-[5%] lg:-left-12 lg:top-[70%] lg:w-[500px] lg:object-cover lg:opacity-[15%]"
          alt=""
        />
        <img
          src={redBlueFirework}
          className="absolute bottom-[20%] right-0 opacity-[5%] lg:bottom-[9%] lg:right-40 lg:w-[200px] lg:object-cover lg:opacity-[20%]"
          alt=""
        />
        <img
          src={threeLines}
          className="absolute -bottom-40 w-full object-cover lg:-bottom-80 xl:-bottom-96"
          alt=""
        />
      </div>
    </div>
  );
};
