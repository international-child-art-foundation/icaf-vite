import { NewsList } from '@/components/news/NewsList';
import NewsGuy from '@/assets/news/newspaper.svg';
import { Seo } from '@/components/shared/Seo';

const newsMetadata = {
  title: 'News | ICAF',
  description:
    'Catch up on the latest news surrounding the International Child Art Foundation.',
  path: '/news-events/news',
};

export const News = () => {
  return (
    <>
      <Seo {...newsMetadata} />
      <div className="content-gap">
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
