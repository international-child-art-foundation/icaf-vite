import { NewsListItem } from '@icaf/shared';
import { useState, useEffect } from 'react';
import { NewsItem } from './NewsItem';
import { listNews } from '@/api/public';

export const NewsList = () => {
  const [newsList, setNewsList] = useState<NewsListItem[]>([]);

  useEffect(() => {
    listNews({ limit: 100 })
      .then((response) => setNewsList(response.news))
      .catch(console.error);
  }, []);

  return (
    <div className="content-w m-pad flex flex-col gap-2 rounded-lg bg-gray-50/40 p-4 px-2 md:p-6 md:px-6 lg:p-8 lg:px-10 xl:p-10 xl:px-14">
      {newsList.map((newsItem: NewsListItem, idx) => (
        <NewsItem key={newsItem.news_id} newsItem={newsItem} idx={idx} />
      ))}
    </div>
  );
};
