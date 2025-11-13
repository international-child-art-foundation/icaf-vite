import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryTimelineDesktop } from '@/components/history/HistoryTimelineDesktop';
import { HistoryTimelineMobile } from '@/components/history/HistoryTimelineMobile';
import { useWindowSize } from 'usehooks-ts';

export const History = () => {
  const size = useWindowSize();

  return (
    <div>
      <div>
        <HistoryHeader />

        {size.width >= 1024 ? (
          <HistoryTimelineDesktop />
        ) : (
          <HistoryTimelineMobile />
        )}
      </div>
    </div>
  );
};
