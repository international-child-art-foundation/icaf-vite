const COVER_TARGET = 4;

/**
 * After removing art_ids from a group, repopulate cover_art_ids up to COVER_TARGET
 * by pulling candidates from remaining member_art_ids in list order.
 * Returns the original array unchanged if already at or above target.
 */
export function repopulateCovers(memberIds: string[], currentCoverIds: string[]): string[] {
  if (currentCoverIds.length >= COVER_TARGET) return currentCoverIds;
  const inCovers = new Set(currentCoverIds);
  const candidates = memberIds.filter((id) => !inCovers.has(id));
  const needed = COVER_TARGET - currentCoverIds.length;
  return [...currentCoverIds, ...candidates.slice(0, needed)];
}
