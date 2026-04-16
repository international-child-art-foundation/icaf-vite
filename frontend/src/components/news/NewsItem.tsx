import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  INewsItem,
  INewsLinkItem,
  INewsAudioItem,
  isAudioNewsItem,
} from '@/types/NewsTypes';
import { FlairColorMap } from '../shared/FlairColorMap';
import { NewsAudioPlayer, NewsAudioPlayerHandle } from './NewsAudioPlayer';
import { NewsTranscript } from './NewsTranscript';

interface NewsItemProps {
  newsItem: INewsItem;
  idx: number;
}

function useAccentColor(idx: number) {
  return useMemo(() => {
    const keys = [
      'red',
      'yellow',
      'green',
      'blue',
      'purple',
      'black',
    ] as (keyof typeof FlairColorMap)[];
    const colorKey = keys[idx % keys.length];
    return FlairColorMap[colorKey].background;
  }, [idx]);
}

function NewsMeta({
  source,
  place,
  date,
}: {
  source?: string;
  place?: string;
  date?: string;
}) {
  return (
    <p className="text-sm text-gray-700">
      {source && place ? (
        <>
          <span className="italic">{source}</span>
          <span>, {place} — </span>
        </>
      ) : source ? (
        <span className="italic">{source} — </span>
      ) : (
        <span>{place} — </span>
      )}
      <span>{date}</span>
    </p>
  );
}

const LinkNewsItem = memo(
  ({ newsItem, idx }: { newsItem: INewsLinkItem; idx: number }) => {
    const barColorClass = useAccentColor(idx);

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

        <NewsMeta
          source={newsItem.source}
          place={newsItem.place}
          date={newsItem.date}
        />
      </a>
    );
  },
);
LinkNewsItem.displayName = 'LinkNewsItem';

const AudioNewsItem = memo(
  ({ newsItem, idx }: { newsItem: INewsAudioItem; idx: number }) => {
    const barColorClass = useAccentColor(idx);
    const playerRef = useRef<NewsAudioPlayerHandle | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [transcriptExpanded, setTranscriptExpanded] = useState(false);

    const handleSeek = useCallback((seconds: number) => {
      playerRef.current?.seek(seconds);
    }, []);

    const handleFirstPlay = useCallback(() => {
      setTranscriptExpanded(true);
    }, []);

    return (
      <div
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
              'text-[22px] leading-[28px]',
              'font-semibold',
              "[font-variation-settings:'wght'_600]",
            ].join(' ')}
          >
            {newsItem.body}
          </span>

          <span
            className={[
              'col-start-1 row-start-1',
              'text-[22px] leading-[28px]',
              'font-normal',
              "[font-variation-settings:'wght'_450] group-hover:[font-variation-settings:'wght'_600]",
              'transition-[font-variation-settings] duration-150 ease-out',
              'motion-reduce:transition-none',
            ].join(' ')}
          >
            {newsItem.body}
          </span>
        </div>

        <NewsMeta
          source={newsItem.source}
          place={newsItem.place}
          date={newsItem.date}
        />

        <div className="mt-4">
          <NewsAudioPlayer
            ref={playerRef}
            src={newsItem.src}
            title={newsItem.body}
            downloadFilename={newsItem.downloadFilename}
            accentBarClass={barColorClass}
            onTimeUpdate={setCurrentTime}
            onFirstPlay={handleFirstPlay}
          />{' '}
        </div>

        {newsItem.transcriptSrc ? (
          <NewsTranscript
            transcriptSrc={newsItem.transcriptSrc}
            currentTime={currentTime}
            onSeek={handleSeek}
            accentBarClass={barColorClass}
            expanded={transcriptExpanded}
            onExpandedChange={setTranscriptExpanded}
          />
        ) : null}

        {newsItem.link ? (
          <a
            href={newsItem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900"
          >
            View source
          </a>
        ) : null}
      </div>
    );
  },
);
AudioNewsItem.displayName = 'AudioNewsItem';

export const NewsItem = memo(({ newsItem, idx }: NewsItemProps) => {
  if (isAudioNewsItem(newsItem)) {
    return <AudioNewsItem newsItem={newsItem} idx={idx} />;
  }
  return <LinkNewsItem newsItem={newsItem} idx={idx} />;
});
NewsItem.displayName = 'NewsItem';
