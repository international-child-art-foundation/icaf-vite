import {
  formatThemeDisplayName,
  parseThemeSK,
  type GroupListItem,
} from '@icaf/shared';
import { Images, MapPin, Palette, Play, Users, UsersRound } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import { artworkAssetUrl } from '@/utils/galleryProcessing';
import { Button } from '@/shared/components/ui/button';

type GalleryGroupCardProps = {
  group: GroupListItem;
  onOpen: (group: GroupListItem) => void;
  actionSlot?: ReactNode;
  interactiveWithActionSlot?: boolean;
};

function groupLabel(group: GroupListItem): string {
  if (!group.group_type) return '';
  return group.group_type === 'classroom'
    ? 'Classroom'
    : group.group_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function groupThemeLabel(group: GroupListItem): string {
  const theme = group.theme ? parseThemeSK(group.theme) : null;
  return theme ? formatThemeDisplayName(theme) : '';
}

export function GalleryGroupCard({
  group,
  onOpen,
  actionSlot,
  interactiveWithActionSlot = false,
}: GalleryGroupCardProps) {
  const coverIds = group.preview_art_ids.slice(0, 4);
  const location = [group.region, group.country].filter(Boolean).join(', ');
  const owner = group.submitter_display_name;
  const title = group.class_name || group.title || 'Artwork group';
  const theme = groupThemeLabel(group);
  const type = groupLabel(group);
  const isWholeCardInteractive = !actionSlot || interactiveWithActionSlot;
  const openGroup = () => onOpen(group);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isWholeCardInteractive) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openGroup();
  };

  return (
    <article
      role={isWholeCardInteractive ? 'button' : undefined}
      tabIndex={isWholeCardInteractive ? 0 : undefined}
      onClick={isWholeCardInteractive ? openGroup : undefined}
      onKeyDown={handleKeyDown}
      className={`focus-visible:ring-primary group relative grid w-full overflow-hidden rounded-lg border border-black/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 lg:grid-cols-[minmax(320px,0.95fr)_1.05fr] ${
        isWholeCardInteractive ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden bg-neutral-100 text-left lg:min-h-[260px]">
        {coverIds.length > 0 ? (
          <div className="flex h-full w-full items-stretch justify-center -space-x-20 sm:-space-x-24 lg:-space-x-28">
            {coverIds.map((artId: string, index) => (
              <img
                key={artId}
                src={artworkAssetUrl(artId, 'thumb')}
                alt=""
                className="h-full min-h-[230px] w-[58%] min-w-[190px] border-y-0 border-l-4 border-r-0 border-white object-cover shadow-md transition duration-300 group-hover:scale-[1.03] sm:w-[54%] lg:min-h-[260px] lg:w-[50%]"
                style={{ zIndex: coverIds.length - index }}
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-40 w-full items-center justify-center rounded-md bg-[linear-gradient(135deg,#0286C3,#FBB22E,#EE2F4D)] text-white">
            <Images size={42} />
          </div>
        )}
        <span className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800 shadow-sm">
          <Users size={14} />
          {group.member_count} artwork{group.member_count != 1 && 's'}
        </span>
      </div>

      <div className="relative flex min-h-[230px] flex-col justify-between gap-6 p-5 sm:p-7 lg:min-h-[260px]">
        <div>
          <div className="flex flex-wrap gap-2">
            {type && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold leading-tight text-amber-800">
                <UsersRound size={12} strokeWidth={2.2} />
                {type}
              </span>
            )}
            {theme && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold leading-tight text-sky-800">
                <Palette size={12} strokeWidth={2.2} />
                {theme}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold leading-tight text-emerald-800">
                <MapPin size={12} strokeWidth={2.2} />
                {location}
              </span>
            )}
          </div>
          <h3 className="font-montserrat mt-4 text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
            {title}
          </h3>
          {group.class_name &&
            group.title &&
            group.title !== group.class_name && (
              <p className="mt-1 text-base font-medium text-neutral-600">
                {group.title}
              </p>
            )}
          {owner && (
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Submitted by {owner}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 text-left">
          <p className="text-sm text-neutral-500"></p>
          <Button className="inline-flex flex-none items-center justify-center">
            <Play />
            Spotlight View
          </Button>
        </div>
        {actionSlot && <div className="border-t pt-5">{actionSlot}</div>}
      </div>
    </article>
  );
}
