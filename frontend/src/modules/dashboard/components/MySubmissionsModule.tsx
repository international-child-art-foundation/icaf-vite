import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ArtworkListItem, GroupListItem } from '@icaf/shared';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deleteGroup, listGroupSubmissions } from '@/api/groups';
import { deleteArtwork, listArtworkSubmissions } from '@/api/user';
import { getArtwork, getGroup } from '@/api/public';
import ArtworkCard from '@/modules/content/components/gallery/ArtworkCard';
import ArtworkModal from '@/modules/content/components/gallery/ArtworkModal';
import { GallerySlideshowEntry } from '@/modules/content/components/gallery/GallerySlideshowEntry';
import { GalleryGroupCard } from '@/modules/content/components/gallery/GalleryGroupCard';
import {
  artworkAssetUrl,
  formatGalleryLocation,
  formatGalleryTheme,
  getArtistDisplayNameWithAge,
  resolveApiArtwork,
} from '@/utils/galleryProcessing';
import { mapWithConcurrency } from '@/shared/utils/concurrency';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatDate, groupTitle } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

type PendingDelete =
  | { kind: 'artwork'; item: ArtworkListItem }
  | { kind: 'group'; item: GroupListItem };

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
  const [loadingMoreArtworks, setLoadingMoreArtworks] = useState(false);
  const [loadingMoreGroups, setLoadingMoreGroups] = useState(false);
  const [artworkLastKey, setArtworkLastKey] = useState<string | undefined>();
  const [groupLastKey, setGroupLastKey] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
        const responses = await mapWithConcurrency(
          groupEntity.member_art_ids,
          3,
          (artId) => getArtwork(artId),
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
        setArtworkLastKey(
          artResponse.has_more && artResponse.last_key
            ? artResponse.last_key
            : undefined,
        );
        setGroupLastKey(
          groupResponse.has_more && groupResponse.last_key
            ? groupResponse.last_key
            : undefined,
        );
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

  const loadMoreArtworks = () => {
    if (!artworkLastKey) return;
    setLoadingMoreArtworks(true);
    setError(null);
    listArtworkSubmissions({ limit: 12, last_key: artworkLastKey })
      .then((response) => {
        setArtworks((current) => [...current, ...response.artworks]);
        setArtworkLastKey(
          response.has_more && response.last_key
            ? response.last_key
            : undefined,
        );
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load more artwork submissions',
        );
      })
      .finally(() => setLoadingMoreArtworks(false));
  };

  const loadMoreGroups = () => {
    if (!groupLastKey) return;
    setLoadingMoreGroups(true);
    setError(null);
    listGroupSubmissions({ limit: 8, last_key: groupLastKey })
      .then((response) => {
        setGroups((current) => [...current, ...response.groups]);
        setGroupLastKey(
          response.has_more && response.last_key
            ? response.last_key
            : undefined,
        );
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load more group submissions',
        );
      })
      .finally(() => setLoadingMoreGroups(false));
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPendingDelete(null);
    setDeleteAcknowledged(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !deleteAcknowledged || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      if (pendingDelete.kind === 'artwork') {
        const artId = pendingDelete.item.art_id;
        await deleteArtwork(artId);
        setArtworks((current) =>
          current.filter((artwork) => artwork.art_id !== artId),
        );
        if (pendingDelete.item.group_id) {
          setGroups((current) =>
            current.map((group) =>
              group.group_id === pendingDelete.item.group_id
                ? {
                    ...group,
                    member_count: Math.max(0, group.member_count - 1),
                    preview_art_ids: group.preview_art_ids.filter(
                      (previewArtId) => previewArtId !== artId,
                    ),
                  }
                : group,
            ),
          );
        }
        if (activeArtworkId === artId) setActiveArtworkId('');
        if (exhibitionArtworkId === artId) setExhibitionArtworkId('');
        setActiveGroupArtworks((current) =>
          current.filter((artwork) => artwork.id !== artId),
        );
      } else {
        const groupId = pendingDelete.item.group_id;
        await deleteGroup(groupId);
        setGroups((current) =>
          current.filter((group) => group.group_id !== groupId),
        );
        setArtworks((current) =>
          current.filter((artwork) => artwork.group_id !== groupId),
        );
        setActiveGroupArtworks([]);
        setActiveArtworkId('');
        setExhibitionArtworkId('');
      }

      setPendingDelete(null);
      setDeleteAcknowledged(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete submission',
      );
    } finally {
      setDeleting(false);
    }
  };

  const deleteDialogTitle =
    pendingDelete?.kind === 'group'
      ? 'Delete artwork group?'
      : 'Delete artwork?';
  const deleteDialogDescription =
    pendingDelete?.kind === 'group'
      ? `This will permanently delete ${groupTitle(pendingDelete.item)} and every artwork in the group.`
      : `This will permanently delete ${pendingDelete?.item.title || 'this artwork'}.`;
  const pendingDeleteArtworkItem =
    pendingDelete?.kind === 'artwork' ? pendingDelete.item : null;
  const pendingDeleteArtwork = pendingDeleteArtworkItem
    ? resolveApiArtwork(pendingDeleteArtworkItem)
    : null;
  const pendingDeleteGroup =
    pendingDelete?.kind === 'group' ? pendingDelete.item : null;
  const pendingDeleteArtworkDetails =
    pendingDeleteArtwork && pendingDeleteArtworkItem
      ? [
          ['Title', pendingDeleteArtwork.title],
          ['Artist', getArtistDisplayNameWithAge(pendingDeleteArtwork)],
          ['Theme', formatGalleryTheme(pendingDeleteArtwork)],
          [
            'Location',
            formatGalleryLocation(
              pendingDeleteArtwork.region,
              pendingDeleteArtwork.country,
            ),
          ],
          ['Status', pendingDeleteArtworkItem.status],
          ['Submitted', formatDate(pendingDeleteArtworkItem.ts)],
        ].filter((detail): detail is [string, string] => Boolean(detail[1]))
      : [];
  const pendingDeleteGroupDetails = pendingDeleteGroup
    ? [
        ['Group', groupTitle(pendingDeleteGroup)],
        ['Status', pendingDeleteGroup.status],
        ['Artworks', `${pendingDeleteGroup.member_count}`],
        [
          'Location',
          formatGalleryLocation(
            pendingDeleteGroup.region,
            pendingDeleteGroup.country,
          ),
        ],
        ['Submitted', formatDate(pendingDeleteGroup.ts)],
      ].filter((detail): detail is [string, string] => Boolean(detail[1]))
    : [];
  const pendingDeleteGroupThumbUrl = pendingDeleteGroup?.preview_art_ids[0]
    ? artworkAssetUrl(pendingDeleteGroup.preview_art_ids[0], 'thumb')
    : undefined;

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
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        {pendingDelete && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{deleteDialogTitle}</DialogTitle>
              <DialogDescription>{deleteDialogDescription}</DialogDescription>
            </DialogHeader>
            {pendingDeleteArtwork && (
              <div className="grid gap-4 rounded-md border border-neutral-200 bg-white p-3 sm:grid-cols-[112px_1fr]">
                <img
                  src={pendingDeleteArtwork.thumbUrl}
                  alt={pendingDeleteArtwork.alt || 'Artwork thumbnail'}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <dl className="grid content-start gap-2 text-sm">
                  {pendingDeleteArtworkDetails.map(([label, value]) => (
                    <div key={label} className="grid gap-0.5">
                      <dt className="text-xs font-semibold uppercase text-neutral-500">
                        {label}
                      </dt>
                      <dd className="text-neutral-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {pendingDeleteGroup && (
              <div className="grid gap-4 rounded-md border border-neutral-200 bg-white p-3 sm:grid-cols-[112px_1fr]">
                {pendingDeleteGroupThumbUrl ? (
                  <img
                    src={pendingDeleteGroupThumbUrl}
                    alt=""
                    className="aspect-square w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-md bg-neutral-100" />
                )}
                <dl className="grid content-start gap-2 text-sm">
                  {pendingDeleteGroupDetails.map(([label, value]) => (
                    <div key={label} className="grid gap-0.5">
                      <dt className="text-xs font-semibold uppercase text-neutral-500">
                        {label}
                      </dt>
                      <dd className="text-neutral-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            <label className="flex gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 text-neutral-700">
              <input
                type="checkbox"
                checked={deleteAcknowledged}
                onChange={(event) =>
                  setDeleteAcknowledged(event.target.checked)
                }
                disabled={deleting}
                className="mt-1 h-4 w-4 rounded border-neutral-300"
              />
              <span>
                I understand this deletion cannot be undone
                {pendingDelete.kind === 'group'
                  ? ' and includes every artwork in this group'
                  : ''}
                .
              </span>
            </label>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void confirmDelete()}
                disabled={!deleteAcknowledged || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
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
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-neutral-500">
                            {artwork.status} · Submitted on{' '}
                            {formatDate(artwork.ts)}
                          </p>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setPendingDelete({
                                kind: 'artwork',
                                item: artwork,
                              })
                            }
                            disabled={deleting}
                            aria-label={`Delete ${artwork.title || 'artwork'}`}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            )}
            {artworkLastKey && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMoreArtworks}
                  onClick={loadMoreArtworks}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  {loadingMoreArtworks
                    ? 'Loading more...'
                    : 'Load more artwork'}
                </button>
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
                      <div
                        className="flex flex-wrap items-center justify-between gap-3"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <p className="text-xs text-neutral-500">
                          {groupTitle(group)} · {group.status} ·{' '}
                          {formatDate(group.ts)}
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setPendingDelete({ kind: 'group', item: group })
                          }
                          disabled={deleting}
                          aria-label={`Delete ${groupTitle(group)}`}
                        >
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
            {groupLastKey && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMoreGroups}
                  onClick={loadMoreGroups}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-40"
                >
                  {loadingMoreGroups ? 'Loading more...' : 'Load more groups'}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardModule>
  );
}
