import { NewsList } from '@/components/news/NewsList';
import NewsGuy from '@/assets/news/newspaper.svg';

export const News = () => {
  return (
    <div>
      <div>
        <div className="space-between mt-12 grid grid-cols-2 grid-rows-1 px-8 md:px-12 lg:px-16 xl:px-20">
          <div>
            <h1 className="text-primary font-montserrat mt-12 max-w-screen-2xl text-4xl font-bold">
              News
            </h1>
            <p className="max-w-screen-2xl text-lg text-gray-800">
              Catch up on the latest news surrounding ICAF.
            </p>
          </div>
          <img src={NewsGuy} className="ml-auto" alt="" />
        </div>
        <NewsList />
      </div>
    </div>
  );
};
