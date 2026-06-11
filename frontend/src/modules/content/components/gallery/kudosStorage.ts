const KUDOS_STORAGE_KEY = 'icaf.gallery.kudos.v1';
const DAILY_KUDOS = 50;
const KUDOS_AMOUNT = 10;
export const KUDOS_STORAGE_EVENT = 'icaf:kudos-storage';

type KudosStorageState = {
  day: string;
  givenArtIds: string[];
  remaining: number;
};

export type KudosStatus = {
  alreadyGiven: boolean;
  remaining: number;
};

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const defaultState = (): KudosStorageState => ({
  day: getTodayKey(),
  givenArtIds: [],
  remaining: DAILY_KUDOS,
});

const normalizeState = (state: unknown): KudosStorageState => {
  if (
    typeof state !== 'object' ||
    state === null ||
    Array.isArray(state) ||
    !('day' in state) ||
    !('remaining' in state) ||
    !('givenArtIds' in state)
  ) {
    return defaultState();
  }

  const raw = state as Partial<KudosStorageState>;
  if (raw.day !== getTodayKey()) return defaultState();

  return {
    day: raw.day,
    givenArtIds: Array.isArray(raw.givenArtIds)
      ? raw.givenArtIds.filter((id): id is string => typeof id === 'string')
      : [],
    remaining:
      typeof raw.remaining === 'number'
        ? Math.max(0, Math.min(DAILY_KUDOS, raw.remaining))
        : DAILY_KUDOS,
  };
};

const readState = (): KudosStorageState => {
  if (typeof window === 'undefined') return defaultState();

  try {
    const raw = window.localStorage.getItem(KUDOS_STORAGE_KEY);
    if (!raw) return defaultState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return defaultState();
  }
};

const writeState = (state: KudosStorageState) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KUDOS_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(KUDOS_STORAGE_EVENT));
};

export function getKudosStatus(artId?: string): KudosStatus {
  const state = readState();
  return {
    alreadyGiven: artId ? state.givenArtIds.includes(artId) : false,
    remaining: state.remaining,
  };
}

export function consumeDailyKudos(artId: string): KudosStatus & { ok: boolean } {
  const state = readState();
  const alreadyGiven = state.givenArtIds.includes(artId);

  if (alreadyGiven || state.remaining < KUDOS_AMOUNT) {
    return {
      alreadyGiven,
      ok: false,
      remaining: state.remaining,
    };
  }

  const nextState = {
    ...state,
    givenArtIds: [...state.givenArtIds, artId],
    remaining: state.remaining - KUDOS_AMOUNT,
  };
  writeState(nextState);

  return {
    alreadyGiven: true,
    ok: true,
    remaining: nextState.remaining,
  };
}

export function restoreDailyKudos(artId: string) {
  const state = readState();
  if (!state.givenArtIds.includes(artId)) return;

  writeState({
    ...state,
    givenArtIds: state.givenArtIds.filter((id) => id !== artId),
    remaining: Math.min(DAILY_KUDOS, state.remaining + KUDOS_AMOUNT),
  });
}

export { DAILY_KUDOS, KUDOS_AMOUNT };
