import { MapPin, Palette, UsersRound, type LucideIcon } from 'lucide-react';
import type { TResolvedArtwork } from '@/modules/content/types/Gallery';
import {
  formatGalleryGroup,
  formatGalleryLocation,
  formatGalleryTheme,
  getArtworkDisplayTitle,
  getArtworkSecondaryTitle,
} from '@/utils/galleryProcessing';
import { DescriptionScroll } from './DescriptionScroll';

type GalleryInfoVariant = 'modal' | 'nametag' | 'card';
type DescriptionMode = 'none' | 'plain' | 'scroll';

type GalleryInfoTag = {
  label: string;
  icon: LucideIcon;
  tone: 'location' | 'group' | 'theme';
};

type GalleryArtworkInfoProps = {
  artwork: TResolvedArtwork;
  variant?: GalleryInfoVariant;
  descriptionMode?: DescriptionMode;
  maxTags?: number;
  tagsInDescription?: boolean;
  className?: string;
};

const tagToneClasses = {
  location: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  group: 'border-amber-200 bg-amber-50 text-amber-800',
  theme: 'border-sky-200 bg-sky-50 text-sky-800',
};

function formatGroupTypeLabel(groupType?: string): string {
  if (!groupType) return '';
  if (groupType === 'classroom') return 'Classroom';
  return groupType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getGalleryInfoTags(
  artwork: TResolvedArtwork,
): GalleryInfoTag[] {
  return [
    {
      label: formatGalleryLocation(artwork.region, artwork.country),
      icon: MapPin,
      tone: 'location',
    },
    {
      label: formatGroupTypeLabel(artwork.groupType),
      icon: UsersRound,
      tone: 'group',
    },
    {
      label: formatGalleryGroup(artwork),
      icon: UsersRound,
      tone: 'group',
    },
    {
      label: formatGalleryTheme(artwork),
      icon: Palette,
      tone: 'theme',
    },
  ].filter((tag) => tag.label) as GalleryInfoTag[];
}

const textStyles = {
  modal: {
    title:
      'line-clamp-[6] max-h-[200px] text-2xl font-semibold leading-tight break-words [overflow-wrap:anywhere] text-neutral-950',
    secondary:
      'break-words [overflow-wrap:anywhere] text-base font-medium text-neutral-600',
    meta: 'text-sm font-medium text-neutral-500',
    description: 'text-base leading-7 text-neutral-700',
    tag: 'px-2.5 py-1 text-xs',
    descriptionGroup:
      'mt-3 max-h-[clamp(32px,25dvh,300px)] overflow-y-auto overflow-x-hidden pr-2',
  },
  nametag: {
    title: 'pr-6 text-lg font-semibold leading-snug text-neutral-950',
    secondary: 'pr-6 text-sm font-medium text-neutral-600',
    meta: 'text-sm font-medium text-neutral-500',
    description: 'text-sm leading-6 text-neutral-700',
    tag: 'px-2.5 py-1 text-[11px]',
    descriptionGroup: 'mt-2',
  },
  card: {
    title:
      'truncate text-base font-semibold leading-snug text-neutral-950 xl:text-lg',
    secondary: 'truncate text-sm font-medium text-neutral-600',
    meta: 'text-xs font-medium text-neutral-500',
    description: 'text-sm text-neutral-600',
    tag: 'px-2 py-0.5 text-[11px]',
    descriptionGroup: 'mt-2',
  },
};

export const GalleryArtworkTags = ({
  artwork,
  variant = 'modal',
  maxTags,
  className = '',
}: {
  artwork: TResolvedArtwork;
  variant?: GalleryInfoVariant;
  maxTags?: number;
  className?: string;
}) => {
  const styles = textStyles[variant];
  const tags = getGalleryInfoTags(artwork).slice(0, maxTags);
  if (tags.length === 0) return null;

  return (
    <div className={`flex min-w-0 flex-wrap gap-1.5 ${className}`}>
      {tags.map(({ label, icon: Icon, tone }) => (
        <span
          key={`${tone}-${label}`}
          className={`inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-full border font-semibold leading-tight ${tagToneClasses[tone]} ${styles.tag}`}
        >
          <Icon size={12} strokeWidth={2.2} className="shrink-0" />
          <span className="min-w-0 truncate">{label}</span>
        </span>
      ))}
    </div>
  );
};

export const GalleryArtworkInfo = ({
  artwork,
  variant = 'modal',
  descriptionMode = 'plain',
  maxTags,
  tagsInDescription = descriptionMode !== 'none',
  className = '',
}: GalleryArtworkInfoProps) => {
  const styles = textStyles[variant];
  const primaryText = getArtworkDisplayTitle(artwork);
  const secondaryText = getArtworkSecondaryTitle(artwork);
  const hasTitle = !!artwork.title?.trim();
  const description = artwork.description?.trim() ?? '';
  const hasDescription = description.length > 0;
  const descriptionLabel = `${artwork.f_name?.trim() || 'Artist'} says:`;
  const showDescriptionBlock = descriptionMode !== 'none' && hasDescription;
  const showTagsInDescription = tagsInDescription && showDescriptionBlock;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className={`${styles.title} ${hasTitle ? 'italic' : ''}`}>
        {hasTitle ? <>&ldquo;{primaryText}&rdquo;</> : primaryText}
      </p>
      {secondaryText && (
        <p className={`mt-1 ${styles.secondary}`}>{secondaryText}</p>
      )}
      {!showTagsInDescription && (
        <GalleryArtworkTags
          artwork={artwork}
          variant={variant}
          maxTags={maxTags}
          className={variant === 'card' ? 'mt-2' : 'mt-3'}
        />
      )}
      {showDescriptionBlock && (
        <div className={variant === 'card' ? 'mt-2' : 'mt-4'}>
          <div className={styles.descriptionGroup}>
            {showTagsInDescription && (
              <GalleryArtworkTags
                artwork={artwork}
                variant={variant}
                maxTags={maxTags}
                className="mb-2"
              />
            )}
            <p className={styles.meta}>{descriptionLabel}</p>
            {descriptionMode === 'scroll' ? (
              <DescriptionScroll
                key={`desc-${artwork.id}`}
                description={description}
              />
            ) : (
              <p
                className={`${styles.description} ${
                  variant === 'modal'
                    ? 'break-words [overflow-wrap:anywhere]'
                    : ''
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
