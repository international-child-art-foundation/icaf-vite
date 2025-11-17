import { IicafTimelineEvent } from '@/data/history/icafTimelineData';
import { useWindowSize } from 'usehooks-ts';

interface TimelineEventDesktopProps extends IicafTimelineEvent {
  idx: number;
  side: 'left' | 'right';
  visible: boolean;
  width: number;
}

export const TimelineEventDesktop = ({
  year,
  title,
  description,
  side,
  visible,
  willBreakDesktop,
}: TimelineEventDesktopProps) => {
  const size = useWindowSize();
  const titleDescriptionWidth = size.width >= 1300 ? 500 : 350;
  const bars = Array.from({ length: 5 });

  return (
    <div
      className={`relative flex w-full flex-col ${visible || 'pointer-events-none select-none opacity-0'} ${side === 'left' ? 'items-end' : 'items-start'} gap-0`}
    >
      <div className="relative flex flex-row items-center gap-4">
        <p
          className={` ${willBreakDesktop && size.width < 1300 ? 'mb-36' : 'mb-28'} font-montserrat pointer-events-none absolute mb-32 select-none text-[78px] font-extrabold text-[#D5D5D5] drop-shadow-md ${side === 'left' ? 'right-[160px]' : 'left-[160px]'}`}
        >
          {year}
        </p>
        <p
          className={`${side === 'left' ? 'order-1 text-right' : 'order-3'} text-tertiary-blue font-montserrat h-[80px] content-center text-2xl font-extrabold`}
          style={{ width: titleDescriptionWidth }}
        >
          {title}
        </p>
        <p
          className={`absolute ${willBreakDesktop && size.width < 1300 ? 'mt-[264px]' : 'mt-60'} h-[200px] w-[350px] ${side === 'left' ? 'right-[160px] text-right' : 'left-[160px]'}`}
          style={{ width: titleDescriptionWidth }}
        >
          {description}
        </p>
        <div className="order-2 h-1 w-[100px] rounded-full bg-black"></div>
        <div
          className={`bg-primary h-7 w-7 rounded-full ${side === 'left' ? 'order-3' : 'order-1'}`}
        ></div>
      </div>
      <div className={`${side === 'left' ? 'mr-3' : 'ml-3'} flex w-1 flex-col`}>
        {bars.map((_, idx) => {
          return (
            <div
              // Using index as key is fine here; the list is static, never reordered, has no state
              // eslint-disable-next-line react-x/no-array-index-key
              key={idx}
              className={`${idx % 2 == 0 ? 'bg-primary' : 'bg-background'} h-4 w-1`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};
