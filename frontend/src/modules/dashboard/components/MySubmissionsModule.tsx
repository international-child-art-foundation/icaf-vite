import { useEffect, useState } from 'react';
import type { ArtworkListItem, GroupListItem } from '@icaf/shared';
import { listGroupSubmissions } from '@/api/groups';
import { listArtworkSubmissions } from '@/api/user';
import ArtworkCard from '@/modules/content/components/gallery/ArtworkCard';
import { GalleryGroupCard } from '@/modules/content/components/gallery/GalleryGroupCard';
import { resolveApiArtwork } from '@/utils/galleryProcessing';
import { artworkLabel, formatDate, groupTitle } from '../utils/dashboardFormat';
import { DashboardModule, ModuleState } from './DashboardModule';

export function MySubmissionsModule() {
  const [artworks, setArtworks] = useState<ArtworkListItem[]>([]);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      {error && <ModuleState tone="error">{error}</ModuleState>}
      {loading ? (
        <ModuleState>Loading your submissions...</ModuleState>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Artwork
            </h3>
            {artworks.length === 0 ? (
              <ModuleState>No artwork submissions found.</ModuleState>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {artworks.map((artwork) => {
                  const resolvedArtwork = resolveApiArtwork(artwork);
                  return (
                    <ArtworkCard
                      key={artwork.art_id}
                      artwork={resolvedArtwork}
                      openModal={() =>
                        window.open(
                          resolvedArtwork.displayUrl,
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }
                      actionSlot={
                        <p className="text-xs text-neutral-500">
                          {artworkLabel(artwork)} · {artwork.status} ·{' '}
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
                    onOpen={() => undefined}
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
