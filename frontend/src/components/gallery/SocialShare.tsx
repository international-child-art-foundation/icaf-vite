import { useState } from 'react';
import { FacebookIcon } from '@/assets/shared/icons/gallery/FacebookIconGallery';
import { TwitterIcon } from '@/assets/shared/icons/gallery/TwitterIconGallery';
import { LinkedinIcon } from '@/assets/shared/icons/gallery/LinkedinIconGallery';
import { WhatsappIcon } from '@/assets/shared/icons/gallery/WhatsappIconGallery';
import { ShareIcon } from '@/assets/shared/icons/gallery/ShareIconGallery';

interface SocialShareProps {
  shareUrl: string;
  center?: boolean;
}

export const SocialShare = ({ shareUrl, center = false }: SocialShareProps) => {
  const [showCopiedPopup, setShowCopiedPopup] = useState(false);

  const encodeUrl = encodeURIComponent(shareUrl);

  const platforms = [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeUrl}`,
      Icon: FacebookIcon,
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${encodeUrl}`,
      Icon: WhatsappIcon,
    },
    {
      name: 'X',
      url: `https://twitter.com/intent/tweet?url=${encodeUrl}`,
      Icon: TwitterIcon,
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeUrl}`,
      Icon: LinkedinIcon,
    },
  ];

  const openPopup = (url: string) => {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    window.open(
      url,
      'sharePopup',
      `status=1,width=${width},height=${height},top=${top},left=${left}`,
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedPopup(true);
      setTimeout(() => setShowCopiedPopup(false), 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className={`mt-4 ${center ? 'text-center' : ''}`}>
      <div className={`flex space-x-2 ${center ? 'justify-center' : ''}`}>
        <button
          type="button"
          onClick={() => {
            void copyToClipboard();
          }}
          aria-label="Copy link"
          className="rounded-full active:scale-95 active:opacity-70"
        >
          <ShareIcon />
        </button>
        {platforms.map(({ name, url, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => openPopup(url)}
            aria-label={`Share on ${name}`}
            className="h-8 w-8 rounded-full active:scale-95 active:opacity-70"
          >
            <Icon />
          </button>
        ))}
      </div>
      <p
        className={`mt-1 text-sm transition-opacity ${showCopiedPopup ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        Link copied!
      </p>
    </div>
  );
};
