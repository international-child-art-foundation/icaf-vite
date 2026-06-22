export const SINGLE_ARTWORK_DRAFT_KEY = 'icaf.submitArtworkDraft.v1';
export const ARTWORK_GROUP_DRAFT_KEY = 'icaf.submitArtworkGroupDraft.v1';

const SUBMISSION_DRAFT_TTL_MS = 60 * 60 * 1000;

type StoredSubmissionDraft = {
  draft: unknown;
  expiresAt: number;
};

function isStoredSubmissionDraft(value: unknown): value is StoredSubmissionDraft {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<StoredSubmissionDraft>;
  return Number.isFinite(candidate.expiresAt) && 'draft' in candidate;
}

export function readSubmissionDraft(key: string): unknown {
  if (typeof window === 'undefined') return null;

  const storedValue = window.localStorage.getItem(key);
  if (!storedValue) return null;

  try {
    const storedDraft: unknown = JSON.parse(storedValue);
    if (
      !isStoredSubmissionDraft(storedDraft) ||
      storedDraft.expiresAt <= Date.now()
    ) {
      window.localStorage.removeItem(key);
      return null;
    }

    return storedDraft.draft;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function writeSubmissionDraft(key: string, draft: unknown): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    key,
    JSON.stringify({
      draft,
      expiresAt: Date.now() + SUBMISSION_DRAFT_TTL_MS,
    }),
  );
}

export function clearSubmissionDrafts(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(SINGLE_ARTWORK_DRAFT_KEY);
  window.localStorage.removeItem(ARTWORK_GROUP_DRAFT_KEY);
}
