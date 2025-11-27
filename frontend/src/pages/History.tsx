import { HistoryHeader } from '@/components/history/HistoryHeader';
import { HistoryMomentsCarousel } from '@/components/history/HistoryMomentsCarousel';
import { HistoryTimeline } from '@/components/history/HistoryTimeline';
import { YourDonationGiraffe } from '@/components/history/YourDonationGiraffe';
import { useWindowSize } from 'usehooks-ts';
import { Seo } from '@/components/shared/Seo';

const historyMetadata = {
  title: 'History | ICAF',
  description:
    'Learn about the major events that have shaped ICAF since its inception in 1997.',
  path: '/about/history',
};

export const History = () => {
  const size = useWindowSize();

  return (
    <>
      <Seo {...historyMetadata} />
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
    </>
  );
};
