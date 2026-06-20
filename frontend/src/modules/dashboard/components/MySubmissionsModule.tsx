import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ArtworkListItem, GroupListItem } from '@icaf/shared';
import { Link } from 'react-router-dom';
import { listGroupSubmissions } from '@/api/groups';
import { listArtworkSubmissions } from '@/api/user';
import { getArtwork, getGroup } from '@/api/public';
import ArtworkCard from '@/modules/content/components/gallery/ArtworkCard';
import ArtworkModal from '@/modules/content/components/gallery/ArtworkModal';
import { GallerySlideshowEntry } from '@/modules/content/components/gallery/GallerySlideshowEntry';
import { GalleryGroupCard } from '@/modules/content/components/gallery/GalleryGroupCard';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import { formatDate, groupTitle } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

function useMediaQuery(query: string, fallback = false) {
  const getMatches = useCallback(() => {
    if (typeof window === 'undefined') return fallback;
    return window.matchMedia(query).matches;
  }, [fallback, query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQueryList.matches);

    updateMatches();
    mediaQueryList.addEventListener('change', updateMatches);
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

export function MySubmissionsModule() {
  const [artworks, setArtworks] = useState<ArtworkListItem[]>([]);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [activeArtworkId, setActiveArtworkId] = useState('');
  const [exhibitionArtworkId, setExhibitionArtworkId] = useState('');
  const [activeGroupArtworks, setActiveGroupArtworks] = useState<
    ReturnType<typeof resolveApiArtwork>[]
  >([]);
  const [groupSlideshowLoading, setGroupSlideshowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isHorizontal = useMediaQuery('(orientation: landscape)', true);
  const resolvedArtworks = useMemo(
    () => artworks.map((artwork) => resolveApiArtwork(artwork)),
    [artworks],
  );
  const isModalOpen = Boolean(activeArtworkId);
  const modalArtworks =
    activeGroupArtworks.length > 0 ? activeGroupArtworks : resolvedArtworks;

  const openGroupSlideshow = (group: GroupListItem) => {
    setGroupSlideshowLoading(true);
    setError(null);
    getGroup(group.group_id)
      .then(async ({ group: groupEntity }) => {
        const responses = await Promise.all(
          groupEntity.member_art_ids.map((artId) => getArtwork(artId)),
        );
        const metadata = {
          groupTitle: groupEntity.class_name || groupEntity.title,
          groupOwnerName: groupEntity.submitter_display_name,
          groupType: groupEntity.group_type,
          groupCountry: groupEntity.country,
          groupRegion: groupEntity.region,
        };
        const groupArtworks = responses.map(({ artwork }) =>
          resolveApiArtwork(artwork, metadata),
        );
        if (!groupArtworks.length) throw new Error('This group has no artworks.');
        setActiveGroupArtworks(groupArtworks);
        setActiveArtworkId(groupArtworks[0].id);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load group slideshow',
        );
      })
      .finally(() => setGroupSlideshowLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      listArtworkSubmissions({ limit: 12 }),
      listGroupSubmissions({ limit: 8 }),
    ])
      .then(([artResponse, groupResponse]) => {
        setArtworks(artResponse.artworks);
        setGroups(groupResponse.groups);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load your submissions',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardModule
      title="My submissions"
      description="See your published and pending artwork submissions."
    >
      {exhibitionArtworkId && (
        <GallerySlideshowEntry
          context={{
            artworks: modalArtworks,
            preserveOrder: activeGroupArtworks.length > 0,
            initialArtworkId: exhibitionArtworkId,
          }}
          onClose={() => {
            setExhibitionArtworkId('');
            setActiveGroupArtworks([]);
          }}
        />
      )}
      <ArtworkModal
        id={activeArtworkId}
        artworks={modalArtworks}
        artworksLoading={loading || groupSlideshowLoading}
        navigationList={modalArtworks}
        onNavigate={setActiveArtworkId}
        closeModal={() => {
          setActiveArtworkId('');
          setActiveGroupArtworks([]);
        }}
        isHorizontal={isHorizontal}
        modalState={isModalOpen}
        getShareUrl={() => window.location.href}
        onEnterExhibition={(id) => {
          setExhibitionArtworkId(id);
          setActiveArtworkId('');
        }}
      />
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {groupSlideshowLoading && (
        <ModuleState>Loading group slideshow...</ModuleState>
      )}
      {loading ? (
        <ModuleState>Loading your submissions...</ModuleState>
      ) : (
        <div className="flex flex-col gap-8">
          <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-700">
            Need to update information about an artwork?{' '}
            <Link
              className="text-secondary-blue font-semibold underline-offset-4 hover:underline"
              to="/contact"
            >
              Contact us
            </Link>{' '}
            and include the artwork title in your message.
          </p>
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Artwork
            </h3>
            {artworks.length === 0 ? (
              <ModuleState>No artwork submissions found.</ModuleState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {resolvedArtworks.map((resolvedArtwork) => {
                  const artwork = artworks.find(
                    (item) => item.art_id === resolvedArtwork.art_id,
                  );
                  if (!artwork) return null;
                  return (
                    <ArtworkCard
                      key={resolvedArtwork.id}
                      artwork={resolvedArtwork}
                      openModal={setActiveArtworkId}
                      actionSlot={
                        <p className="text-xs text-neutral-500">
                          {artwork.status} · Submitted on{' '}
                          {formatDate(artwork.ts)}
                        </p>
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Groups
            </h3>
            {groups.length === 0 ? (
              <ModuleState>No group submissions found.</ModuleState>
            ) : (
              <div className="flex flex-col gap-4">
                {groups.map((group) => (
                  <GalleryGroupCard
                    key={group.group_id}
                    group={group}
                    onOpen={openGroupSlideshow}
                    interactiveWithActionSlot
                    actionSlot={
                      <p className="text-xs text-neutral-500">
                        {groupTitle(group)} · {group.status} ·{' '}
                        {formatDate(group.ts)}
                      </p>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardModule>
  );
}
