import { Play } from 'lucide-react';

export type VideoHandle = {
  play: () => void;
  pause: () => void;
  isStarted: () => boolean;
};

interface VideoWrapperPlaceholderProps {
  src?: string;
  thumbnail?: string;
  curved?: boolean;
  className?: string;
}

export const VideoWrapperPlaceholder = ({
  src,
  thumbnail,
  curved,
  className,
}: VideoWrapperPlaceholderProps) => {
  return (
    <div
      className={[
        'relative aspect-video w-full items-center justify-center bg-gray-700/60 text-white',
        curved ? 'overflow-hidden rounded-xl' : '',
        className || '',
      ].join(' ')}
      aria-label="Video placeholder"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : null}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-4 py-3">
        <div
          className="flex items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md"
          style={{ width: 64, height: 64 }}
        >
          <Play aria-hidden className="h-7 w-7 text-gray-900" />
        </div>
        <div className="text-xs opacity-90">
          {src ? 'Video placeholder (src set)' : 'Video placeholder'}
        </div>
      </div>
    </div>
  );
};
