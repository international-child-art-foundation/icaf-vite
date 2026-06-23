import { HistoryHeader } from '@/modules/content/components/history/HistoryHeader';
import { HistoryMomentsCarousel } from '@/modules/content/components/history/HistoryMomentsCarousel';
import { HistoryTimeline } from '@/modules/content/components/history/HistoryTimeline';
import { YourDonationGiraffe } from '@/modules/content/components/history/YourDonationGiraffe';
import { useWindowSize } from 'usehooks-ts';
import { Seo } from '@/modules/content/components/shared/Seo';

const historyMetadata = {
  title: 'ICAF History — Empowering Children Through the Arts Since 1997',
  description:
    'Explore the history of the International Child Art Foundation — from our founding in 1997 to decades of global impact through arts education and cultural exchange.',
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
