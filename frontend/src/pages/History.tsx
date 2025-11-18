import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryMomentsCarousel } from '@/components/history/HistoryMomentsCarousel';
import { HistoryTimeline } from '@/components/history/HistoryTimeline';
import { YourDonationGiraffe } from '@/components/history/YourDonationGiraffe';
import { useWindowSize } from 'usehooks-ts';

export const History = () => {
  const size = useWindowSize();

  return (
    <div>
      <div className="overflow-hidden">
        <HistoryHeader />

        {size.width >= 1024 ? (
          <HistoryTimeline mode={'desktop'} />
        ) : (
          <HistoryTimeline mode={'mobile'} />
        )}
        <HistoryMomentsCarousel />
        <YourDonationGiraffe />
      </div>
    </div>
  );
};
