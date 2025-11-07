import { memo, useMemo } from 'react';
import { INewsItem } from '@/types/NewsTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

interface NewsItemProps {
  newsItem: INewsItem;
  idx: number;
}

export const NewsItem = memo(({ newsItem, idx }: NewsItemProps) => {
  const colorKey = useMemo(() => {
    const keys = [
      'red',
      'yellow',
      'green',
      'blue',
      'purple',
      'black',
    ] as (keyof typeof FlairColorMap)[];
    return keys[idx % keys.length];
  }, [idx]);

  const barColorClass = FlairColorMap[colorKey].background;

  return (
    <a
      href={newsItem.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative z-10 rounded-md p-6 shadow-sm transition-colors duration-300 hover:bg-white"
      aria-label={newsItem.body}
    >
      <div
        className={[
          barColorClass,
          'pointer-events-none absolute inset-y-0 left-0 w-[4px]',
          'origin-center scale-y-0 transform-gpu transition-transform duration-300 ease-out',
          '[will-change:transform] group-hover:scale-y-100',
          'motion-reduce:transform-none motion-reduce:transition-none',
        ].join(' ')}
      />

      <div className="relative grid grid-cols-1 grid-rows-1">
        <span
          aria-hidden="true"
          className={[
            'col-start-1 row-start-1',
            'block opacity-0',
            'text-[22px] leading-[28px] underline underline-offset-2',
            'font-semibold',
            "[font-variation-settings:'wght'_600]",
          ].join(' ')}
        >
          {newsItem.body}
        </span>

        <span
          className={[
            'col-start-1 row-start-1',
            'text-[22px] leading-[28px] underline underline-offset-2',
            'font-normal',
            "[font-variation-settings:'wght'_450] group-hover:[font-variation-settings:'wght'_600]",
            'transition-[font-variation-settings] duration-150 ease-out',
            'motion-reduce:transition-none',
          ].join(' ')}
        >
          {newsItem.body}
        </span>
      </div>

      <p className="text-sm text-gray-700">
        {newsItem.source && newsItem.place ? (
          <>
            <span className="italic">{newsItem.source}</span>
            <span>, {newsItem.place} — </span>
          </>
        ) : newsItem.source ? (
          <span className="italic">{newsItem.source} — </span>
        ) : (
          <span>{newsItem.place} — </span>
        )}
        <span>{newsItem.date}</span>
      </p>
    </a>
  );
});
