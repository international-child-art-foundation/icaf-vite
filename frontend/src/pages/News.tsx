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
      <div>
        <div>
          <div className="space-between mt-12 grid grid-cols-2 grid-rows-1 px-8 md:px-12 lg:px-16 xl:px-20">
            <div>
              <h1 className="text-primary font-montserrat max-w-screen-3xl mt-12 text-4xl font-bold">
                News
              </h1>
              <p className="max-w-screen-3xl text-lg text-gray-800">
                Catch up on the latest news surrounding ICAF.
              </p>
            </div>
            <img src={NewsGuy} className="ml-auto" alt="" />
          </div>
          <NewsList />
        </div>
      </div>
    </>
  );
};
