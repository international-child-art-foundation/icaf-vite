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
    <div className="my-4 flex max-w-screen-2xl flex-col gap-2 rounded-lg bg-gray-50/40 p-4 px-2 md:my-6 md:p-6 md:px-6 lg:my-8 lg:p-8 lg:px-10 xl:my-10 xl:p-10 xl:px-14">
      {newsList.map((newsItem: INewsItem, idx) => (
        <NewsItem
          key={newsItem.body + newsItem.date + newsItem.source}
          newsItem={newsItem}
          idx={idx}
        />
      ))}
    </div>
  );
};
