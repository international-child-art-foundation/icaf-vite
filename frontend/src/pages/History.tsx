import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryTimeline } from '@/components/history/HistoryTimeline';
export const History = () => {
  return (
    <div>
      <div>
        <HistoryHeader />
        <HistoryTimeline />
      </div>
    </div>
  );
};
