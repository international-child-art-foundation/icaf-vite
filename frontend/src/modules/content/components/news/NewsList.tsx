import { NewsListItem } from '@icaf/shared';
import { useCallback, useEffect, useState } from 'react';
import { NewsItem } from './NewsItem';
import { listNews } from '@/api/public';
import { Button } from '@/shared/components/ui/button';

export const NewsList = () => {
  const [newsList, setNewsList] = useState<NewsListItem[]>([]);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNews = useCallback((nextKey?: string) => {
    setLoading(true);
    listNews({ limit: 50, ...(nextKey ? { last_key: nextKey } : {}) })
      .then((response) => {
        setNewsList((current) =>
          nextKey ? [...current, ...response.news] : response.news,
        );
        setLastKey(response.last_key);
        setHasMore(Boolean(response.has_more && response.last_key));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <div className="content-w m-pad flex flex-col gap-2 rounded-lg bg-gray-50/40 p-4 px-2 md:p-6 md:px-6 lg:p-8 lg:px-10 xl:p-10 xl:px-14">
      {newsList.map((newsItem: NewsListItem, idx) => (
        <NewsItem key={newsItem.news_sk} newsItem={newsItem} idx={idx} />
      ))}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadNews(lastKey)}
            disabled={loading}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
