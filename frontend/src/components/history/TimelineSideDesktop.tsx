import { IicafTimelineEvent } from '@/data/history/icafTimelineData';
import { IicafTimelineData } from '@/types/HistoryTypes';
import { TimelineEventDesktop } from './TimelineEventDesktop';

interface TimelineSideDesktopProps {
  side: 'left' | 'right';
  data: IicafTimelineData[];
  className: string;
  width: number;
}

export const TimelineSideDesktop = ({
  side,
  data,
  className,
  width,
}: TimelineSideDesktopProps) => {
  const bothClasses = `w-[${width}px] `;
  const leftClasses = bothClasses + `justify-items-start`;
  const rightClasses = bothClasses + ` justify-items-end`;
  return (
    <div
      className={`${side === 'left' ? leftClasses : rightClasses} ${className}`}
      style={
        side === 'left'
          ? { marginRight: `${width - 28}px` }
          : { marginLeft: `${width - 28}px` }
      }
    >
      {data.map((timelineEvent: IicafTimelineEvent, idx) => (
        <TimelineEventDesktop
          {...timelineEvent}
          idx={idx}
          key={timelineEvent.title}
          side={side}
          width={width}
          visible={side === 'left' ? idx % 2 == 0 : idx % 2 == 1}
        />
      ))}
    </div>
  );
};
