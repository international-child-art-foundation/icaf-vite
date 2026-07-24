import type { IMagazine } from '@/modules/content/types/Magazines';
import { listMagazines } from '@/api/public';
import { compareMagazinesByPublicationDesc } from '@icaf/shared';
import type { MagazineListItem } from '@icaf/shared';

const MAGAZINE_CACHE_TTL_MS = 3 * 60 * 60 * 1000;

let _cache: { expiresAt: number; magazines: IMagazine[] } | null = null;
let _pending: Promise<IMagazine[]> | null = null;

function toUiMagazine(magazine: MagazineListItem): IMagazine {
  return {
    period: magazine.period,
    name: magazine.name,
    volume: magazine.volume,
    link: magazine.link_url,
    cover: magazine.thumbnail_url,
  };
}

export async function getMagazines(): Promise<IMagazine[]> {
  if (_cache && _cache.expiresAt > Date.now()) return _cache.magazines;
  if (_pending) return _pending;

  _pending = listMagazines({ cacheTtlMs: MAGAZINE_CACHE_TTL_MS })
    .then((response) =>
      [...response.magazines]
        .sort(compareMagazinesByPublicationDesc)
        .map(toUiMagazine),
    )
    .then((magazines) => {
      _cache = {
        expiresAt: Date.now() + MAGAZINE_CACHE_TTL_MS,
        magazines,
      };
      return magazines;
    })
    .catch((err) => {
      console.error(err);
      return _cache?.magazines ?? [];
    })
    .finally(() => {
      _pending = null;
    });

  return _pending;
}
