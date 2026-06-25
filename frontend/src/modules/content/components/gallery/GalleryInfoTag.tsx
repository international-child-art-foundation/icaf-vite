import type { LucideIcon } from 'lucide-react';
import { CountryFlag } from '@/shared/components/CountryFlag';

export type GalleryInfoTagTone = 'location' | 'group' | 'theme';

export type GalleryInfoTagData = {
  label: string;
  icon: LucideIcon;
  country?: string;
  tone: GalleryInfoTagTone;
};

const tagToneClasses: Record<GalleryInfoTagTone, string> = {
  location: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  group: 'border-amber-200 bg-amber-50 text-amber-800',
  theme: 'border-sky-200 bg-sky-50 text-sky-800',
};

type GalleryInfoTagProps = {
  tag: GalleryInfoTagData;
  className?: string;
  iconSize?: number;
  labelOverflow?: 'truncate' | 'wrap';
};

export function GalleryInfoTag({
  tag,
  className = '',
  iconSize = 12,
  labelOverflow = 'truncate',
}: GalleryInfoTagProps) {
  const { label, icon: Icon, country, tone } = tag;
  const wraps = labelOverflow === 'wrap';

  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border font-semibold leading-tight ${wraps ? '' : 'overflow-hidden'} ${tagToneClasses[tone]} ${className}`}
    >
      <CountryFlag
        country={country}
        className="h-3 w-[18px] shrink-0 rounded-[1px] object-cover shadow-sm"
        fallback={
          <Icon size={iconSize} strokeWidth={2.2} className="shrink-0" />
        }
      />
      <span
        className={
          wraps
            ? 'min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]'
            : 'min-w-0 truncate'
        }
      >
        {label}
      </span>
    </span>
  );
}
