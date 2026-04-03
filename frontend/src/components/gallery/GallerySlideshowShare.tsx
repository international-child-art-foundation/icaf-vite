import React, { useState } from 'react';
import { Check, Link } from 'lucide-react';

interface Props {
  shareUrl: string;
}

const FacebookGlyph = () => (
  <svg viewBox="0 0 32 32" width="23" height="23" fill="white" aria-hidden>
    <path d="M19.9145 17.0465L20.3704 14.1496H17.5618V12.2667C17.5618 11.4746 17.954 10.7006 19.2078 10.7006H20.5026V8.2337C19.7486 8.11345 18.9866 8.0484 18.223 8.03906C15.9114 8.03906 14.4022 9.42865 14.4022 11.9408V14.1496H11.8398V17.0465H14.4022V24.0533H17.5618V17.0465H19.9145Z" />
  </svg>
);

const WhatsappGlyph = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden>
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413z" />
  </svg>
);

const XGlyph = () => (
  <svg viewBox="0 0 32 32" width="23" height="23" fill="white" aria-hidden>
    <path d="M17.5222 14.7749L23.4785 8H22.0671L16.8952 13.8826L12.7644 8H8L14.2466 16.8955L8 24H9.41155L14.8732 17.7878L19.2356 24H24L17.5218 14.7749H17.5222ZM15.5889 16.9738L14.956 16.0881L9.92015 9.03974H12.0882L16.1522 14.728L16.7851 15.6137L22.0677 23.0075H19.8997L15.5889 16.9742V16.9738Z" />
  </svg>
);

const LinkedInGlyph = () => (
  <svg viewBox="0 0 32 32" width="23" height="23" fill="white" aria-hidden>
    <path d="M11.6 24H8.2V13.3H11.6V24ZM9.9 11.8C8.8 11.8 8 11 8 9.9C8 8.8 8.9 8 9.9 8C11 8 11.8 8.8 11.8 9.9C11.8 11 11 11.8 9.9 11.8ZM24 24H20.6V18.2C20.6 16.5 19.9 16 18.9 16C17.9 16 16.9 16.8 16.9 18.3V24H13.5V13.3H16.7V14.8C17 14.1 18.2 13 19.9 13C21.8 13 23.8 14.1 23.8 17.4V24H24Z" />
  </svg>
);

const BTN =
  'flex h-9 w-9 items-center justify-center text-white hover:bg-black/35 active:scale-95 w-full';

export const GallerySlideshowShare: React.FC<Props> = ({ shareUrl }) => {
  const [copied, setCopied] = useState(false);

  const openPopup = (url: string) => {
    const w = 600,
      h = 400;
    window.open(
      url,
      'sharePopup',
      `status=1,width=${w},height=${h},top=${(window.innerHeight - h) / 2},left=${(window.innerWidth - w) / 2}`,
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error('Failed to copy share link');
    }
  };

  const enc = encodeURIComponent(shareUrl);

  return (
    <div className="flex w-full items-center overflow-hidden rounded-xl bg-black/50">
      <button
        type="button"
        className={BTN}
        onClick={(e) => {
          e.stopPropagation();
          void copyLink();
        }}
        aria-label="Copy link"
      >
        {copied ? <Check size={20} /> : <Link size={20} />}
      </button>
      <button
        type="button"
        className={BTN}
        onClick={(e) => {
          e.stopPropagation();
          openPopup(`https://www.facebook.com/sharer/sharer.php?u=${enc}`);
        }}
        aria-label="Share on Facebook"
      >
        <FacebookGlyph />
      </button>
      <button
        type="button"
        className={BTN}
        onClick={(e) => {
          e.stopPropagation();
          openPopup(`https://wa.me/?text=${enc}`);
        }}
        aria-label="Share on WhatsApp"
      >
        <WhatsappGlyph />
      </button>
      <button
        type="button"
        className={BTN}
        onClick={(e) => {
          e.stopPropagation();
          openPopup(`https://twitter.com/intent/tweet?url=${enc}`);
        }}
        aria-label="Share on X"
      >
        <XGlyph />
      </button>
      <button
        type="button"
        className={BTN}
        onClick={(e) => {
          e.stopPropagation();
          openPopup(
            `https://www.linkedin.com/shareArticle?mini=true&url=${enc}`,
          );
        }}
        aria-label="Share on LinkedIn"
      >
        <LinkedInGlyph />
      </button>
    </div>
  );
};
