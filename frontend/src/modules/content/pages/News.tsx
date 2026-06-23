import { NewsList } from '@/modules/content/components/news/NewsList';
import NewsGuy from '@/modules/content/assets/news/newspaper.svg';
import { Seo } from '@/modules/content/components/shared/Seo';

const newsMetadata = {
  title: 'ICAF News — Latest Updates, Stories & Announcements',
  description:
    'Stay up to date with the latest news, stories, and announcements from the International Child Art Foundation and our global arts education programs.',
  path: '/news-events/news',
};

export const News = () => {
  return (
    <>
      <Seo {...newsMetadata} />
      <div className="content-gap mt-12">
        <div className="content-w m-pad space-between grid grid-cols-2 grid-rows-1">
          <div>
            <h1 className="text-primary font-montserrat mt-12 text-4xl font-bold">
              News
            </h1>
            <p className="text-lg text-gray-800">
              Catch up on the latest news surrounding ICAF.
            </p>
          </div>
          <img src={NewsGuy} className="ml-auto" alt="" />
        </div>
        <NewsList />
      </div>
    </>
  );
};
