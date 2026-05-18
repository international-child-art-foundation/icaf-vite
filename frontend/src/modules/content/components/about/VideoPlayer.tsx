import { useRef, useState } from 'react';

type VideoPlayerProps = {
  src: string;
  poster?: string;
  className: string;
};

export default function VideoPlayer({
  src,
  poster,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch((error) => {
          console.error('Video play failed:', error);
        });
    }
  };

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className={className}
        controls={playing}
      />
      {!playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {/* Only the button is clickable */}
          <button
            type="button"
            onClick={handlePlay}
            className="group pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full bg-black/50 transition hover:bg-black/70"
            aria-label="Play video"
          >
            <svg
              className="h-8 w-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
