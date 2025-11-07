import { INewsItem } from '@/types/NewsTypes';
import { useState, useEffect } from 'react';
import { NewsItem } from './NewsItem';
import { getNews } from '@/server_asset_handlers/news';

export const NewsList = () => {
  const [newsList, setNewsList] = useState<INewsItem[]>([]);

  useEffect(() => {
    getNews().then(setNewsList).catch(console.error);
  }, []);

  return (
    <div className="px-4">
      <p className="text-primary font-montserrat mt-12 max-w-screen-2xl px-8 text-4xl font-bold md:px-12 lg:px-16 xl:px-20">
        News
      </p>
      <div className="my-4 flex max-w-screen-2xl flex-col gap-2 rounded-lg bg-gray-50/40 p-4 px-2 md:my-6 md:p-6 md:px-6 lg:my-8 lg:p-8 lg:px-10 xl:my-10 xl:p-10 xl:px-14">
        {newsList.map((newsItem: INewsItem, idx) => (
          <NewsItem
            key={newsItem.body + newsItem.date + newsItem.source}
            newsItem={newsItem}
            idx={idx}
          />
        ))}
      </div>
    </div>
  );
};
