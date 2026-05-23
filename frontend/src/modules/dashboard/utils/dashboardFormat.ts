import type { ArtworkListItem, GroupListItem, Role } from '@icaf/shared';

export function roleRank(role: Role | null): number {
  if (role === 'admin') return 3;
  if (role === 'contributor') return 2;
  if (role === 'guardian') return 1;
  return 0;
}

export function canReview(role: Role | null): boolean {
  return roleRank(role) >= roleRank('contributor');
}

export function canAdmin(role: Role | null): boolean {
  return role === 'admin';
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000));
}

export function artworkLabel(artwork: ArtworkListItem): string {
  return artwork.title || artwork.f_name || artwork.art_id;
}

export function groupTitle(group: GroupListItem): string {
  return group.class_name || group.title || group.group_id;
}
