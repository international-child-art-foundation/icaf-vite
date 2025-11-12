import { IicafTimelineEvent } from '@/data/history/icafTimelineData';

interface TimelineEventProps extends IicafTimelineEvent {
  idx: number;
  side: 'left' | 'right';
}

export const TimelineEvent = ({
  year,
  title,
  description,
  idx,
  side,
}: TimelineEventProps) => {
  const bars = Array.from({ length: 6 });

  return (
    <div
      className={`flex w-full flex-col ${side === 'left' ? 'items-end' : 'items-start'} gap-4`}
    >
      <div className="flex flex-row items-center gap-4">
        <p className={`${side === 'left' ? 'order-1' : 'order-3'}`}>{title}</p>
        <div className="order-2 h-2 w-12 bg-black"></div>
        <div
          className={`bg-primary h-7 w-7 rounded-full ${side === 'left' ? 'order-3' : 'order-1'}`}
        ></div>
      </div>
      <div className={`${side === 'left' ? 'mr-3' : 'ml-3'} flex w-1 flex-col`}>
        {bars.map((_, idx) => {
          return (
            <div
              key={idx}
              className={`${idx % 2 == 0 ? 'bg-primary' : 'bg-background'} h-4 w-1`}
            ></div>
          );
        })}
      </div>
    </div>
  );
};
