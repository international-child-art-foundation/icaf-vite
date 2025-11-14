import { IicafTimelineEvent } from '@/data/history/icafTimelineData';
import { useWindowSize } from 'usehooks-ts';

export const TimelineEventMobile = ({
  year,
  title,
  description,
  willBreak,
}: IicafTimelineEvent) => {
  const size = useWindowSize();
  const titleDescriptionWidth = size.width >= 1300 ? 500 : 500;
  const bars = Array.from({ length: 11 });

  return (
    <div className={`relative flex w-full flex-col gap-0`}>
      <div className="-ml-3 flex flex-row items-center gap-2">
        <div className={`bg-primary h-7 w-7 rounded-full`}></div>
        <div className="h-1 min-w-[100px] rounded-full bg-black"></div>
        <div className="relative flex flex-row items-center gap-4">
          <p
            className={` ${willBreak ? 'mb-40' : 'mb-28'} font-montserrat pointer-events-none absolute mb-32 select-none text-[78px] font-extrabold text-[#D5D5D5] drop-shadow-md`}
          >
            {year}
          </p>
          <p
            className={`text-tertiary-blue font-montserrat h-[80px] content-center text-[32px] font-extrabold`}
            style={{ width: titleDescriptionWidth }}
          >
            {title}
          </p>
          <p
            className={`absolute ${willBreak ? 'mt-[310px]' : 'mt-60'} h-[200px] text-lg`}
            style={{ width: titleDescriptionWidth }}
          >
            {description}
          </p>
        </div>
      </div>
      <div className={`flex w-1 flex-col`}>
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
