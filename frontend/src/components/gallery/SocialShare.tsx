import { useState } from 'react';

interface SocialShareProps {
  shareUrl: string;
}

export const SocialShare = ({ shareUrl }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-[#1877F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        X / Twitter
      </a>
      <button
        onClick={copyLink}
        className="rounded border border-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-100"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};
