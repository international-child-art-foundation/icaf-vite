import { NewsList } from '@/components/news/NewsList';
import NewsGuy from '@/assets/news/newspaper.svg';

export const News = () => {
  return (
    <div>
      <div>
        <div className="space-between mt-12 grid grid-cols-2 grid-rows-1 px-8 md:px-12 lg:px-16 xl:px-20">
          <div>
            <p className="text-primary font-montserrat mt-12 max-w-screen-2xl text-4xl font-bold">
              News
            </p>
            <p className="max-w-screen-2xl text-lg text-gray-800">
              Catch up with recent ICAF events.
            </p>
          </div>
          <img src={NewsGuy} className="ml-auto" />
        </div>
        <NewsList />
      </div>
    </div>
  );
};
