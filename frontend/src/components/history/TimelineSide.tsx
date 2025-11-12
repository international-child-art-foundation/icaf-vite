import { IicafTimelineEvent } from '@/data/history/icafTimelineData';
import { IicafTimelineData } from '@/types/HistoryTypes';
import { TimelineEvent } from './TimelineEvent';

interface TimelineSideProps {
  side: 'left' | 'right';
  data: IicafTimelineData[];
  className: string;
}

export const TimelineSide = ({ side, data, className }: TimelineSideProps) => {
  const bothClasses = 'w-[500px ';
  const leftClasses = bothClasses + 'mr-[472px] justify-items-start';
  const rightClasses = 'ml-[472px] justify-items-end';
  return (
    <div
      className={`${side === 'left' ? leftClasses : rightClasses} ${className}`}
    >
      {data.map((timelineEvent: IicafTimelineEvent, idx) => (
        <TimelineEvent
          {...timelineEvent}
          idx={idx}
          key={timelineEvent.title}
          side={side}
        />
      ))}
    </div>
  );
};
