import { HistoryHeader } from '@/modules/content/components/history/HistoryHeader';
import { HistoryMomentsCarousel } from '@/modules/content/components/history/HistoryMomentsCarousel';
import { HistoryTimeline } from '@/modules/content/components/history/HistoryTimeline';
import { YourDonationGiraffe } from '@/modules/content/components/history/YourDonationGiraffe';
import { useWindowSize } from 'usehooks-ts';
import { Seo } from '@/modules/content/components/shared/Seo';

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
      <div className="content-gap overflow-hidden">
        <HistoryHeader />
        {size.width >= 1024 ? (
          <HistoryTimeline mode={'desktop'} />
        ) : (
          <HistoryTimeline mode={'mobile'} />
        )}
        <HistoryMomentsCarousel />
        <YourDonationGiraffe />
      </div>
    </>
  );
};
