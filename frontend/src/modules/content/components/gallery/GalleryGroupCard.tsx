import type { GroupListItem } from '@icaf/shared';
import { Images, MapPin, Play, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { artworkAssetUrl } from '@/utils/galleryProcessing';

type GalleryGroupCardProps = {
  group: GroupListItem;
  onOpen: (group: GroupListItem) => void;
  actionSlot?: ReactNode;
};

function groupLabel(group: GroupListItem): string {
  return group.group_type === 'classroom'
    ? 'Classroom'
    : group.group_type.replace(/_/g, ' ');
}

export function GalleryGroupCard({
  group,
  onOpen,
  actionSlot,
}: GalleryGroupCardProps) {
  const coverIds = group.cover_art_ids.slice(0, 4);
  const location = [group.region, group.country].filter(Boolean).join(', ');
  const owner = group.guardian_display_name || 'Group submission';
  const title = group.class_name || group.title;
  const theme = [group.theme_family, group.theme_instance]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="group relative grid w-full overflow-hidden rounded-lg border border-black/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg lg:grid-cols-[minmax(320px,0.95fr)_1.05fr]">
      <button
        type="button"
        onClick={() => onOpen(group)}
        className="relative grid min-h-[230px] grid-cols-4 items-center overflow-hidden bg-neutral-100 text-left lg:min-h-[260px]"
      >
        {coverIds.length > 0 ? (
          coverIds.map((artId) => (
            <img
              key={artId}
              src={artworkAssetUrl(artId, 'thumb')}
              alt=""
              className={`h-full w-full object-cover transition duration-300 group-hover:scale-105`}
              loading="lazy"
            />
          ))
        ) : (
          <div className="col-span-4 flex items-center justify-center bg-[linear-gradient(135deg,#0286C3,#FBB22E,#EE2F4D)] text-white">
            <Images size={42} />
          </div>
        )}
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800 shadow-sm">
          <Users size={14} />
          {group.member_count} artwork{group.member_count != 1 && 's'}
        </span>
      </button>

      <div className="relative flex min-h-[230px] flex-col justify-between gap-6 p-5 sm:p-7 lg:min-h-[260px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#0286C3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#026997]">
              {groupLabel(group)}
            </span>
            {theme && (
              <span className="rounded-full bg-[#FBB22E]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#805600]">
                {theme}
              </span>
            )}
          </div>
          <h3 className="font-montserrat mt-4 text-2xl font-bold leading-tight text-neutral-950 sm:text-3xl">
            {title}
          </h3>
          {group.class_name && group.title !== group.class_name && (
            <p className="mt-1 text-base font-medium text-neutral-600">
              {group.title}
            </p>
          )}
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Submitted by {owner}
            {location && (
              <span className="mt-1 flex items-center gap-1 text-neutral-500">
                <MapPin size={14} />
                {location}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpen(group)}
          className="flex items-center justify-between gap-4 text-left"
        >
          <p className="text-sm text-neutral-500">
            Open a slideshow from this group only
          </p>
          <span className="bg-primary group-hover:bg-secondary-blue inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-white transition">
            <Play size={18} fill="currentColor" />
          </span>
        </button>
        {actionSlot && <div className="border-t pt-5">{actionSlot}</div>}
      </div>
    </div>
  );
}
