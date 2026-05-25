import { isValidUUID } from '@icaf/shared';

export type ArtworkLookupState =
  | {
      kind: 'artwork';
      artId: string;
      message: string;
    }
  | {
      kind: 'group';
      artId: null;
      message: string;
    }
  | {
      kind: 'missing';
      artId: null;
      message: string;
    }
  | {
      kind: 'invalid';
      artId: null;
      message: string;
    };

const ACCEPTED_QUERY_KEYS = [
  'art_id',
  'artid',
  'artwork',
  'artwork_id',
  'artworkid',
  'id',
] as const;

const REJECTED_QUERY_KEYS = [
  'group',
  'group_id',
  'groupid',
  'groups',
  'group_ids',
] as const;

const ACCEPTED_PATH_SEGMENTS = new Set(['artwork', 'artworks']);
const REJECTED_PATH_SEGMENTS = new Set(['group', 'groups']);

function createUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    try {
      return new URL(input, 'https://example.invalid');
    } catch {
      return null;
    }
  }
}

function getPathLookupState(url: URL): ArtworkLookupState | null {
  const segments = url.pathname.split('/').filter(Boolean);

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index].toLowerCase();
    const nextSegment = segments[index + 1];

    if (ACCEPTED_PATH_SEGMENTS.has(segment) && isValidUUID(nextSegment)) {
      return {
        artId: nextSegment,
        kind: 'artwork',
        message: 'Detected an artwork UUID in the link path.',
      };
    }

    if (REJECTED_PATH_SEGMENTS.has(segment) && isValidUUID(nextSegment)) {
      return {
        artId: null,
        kind: 'group',
        message:
          'This link looks like a group page. We only process artwork takedowns from artwork links.',
      };
    }
  }

  return null;
}

function hasGroupContext(input: string): boolean {
  return /(^|[?&/])(?:group|groups|group_id|groupid)(?:=|\/|:|-)/i.test(
    input,
  );
}

export function lookupArtworkIdFromInput(input: string): ArtworkLookupState {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      artId: null,
      kind: 'missing',
      message: 'Paste an artwork link so we can look for the artwork UUID.',
    };
  }

  if (isValidUUID(trimmedInput)) {
    return {
      artId: trimmedInput,
      kind: 'artwork',
      message: 'Detected a valid artwork UUID.',
    };
  }

  const url = createUrl(trimmedInput);
  if (!url) {
    return {
      artId: null,
      kind: 'invalid',
      message:
        "We couldn't parse that as a URL or an artwork UUID. Please paste the artwork link again.",
    };
  }

  for (const key of ACCEPTED_QUERY_KEYS) {
    const candidate = url.searchParams.get(key);
    if (candidate && isValidUUID(candidate)) {
      return {
        artId: candidate,
        kind: 'artwork',
        message: `Detected artwork UUID from the ${key} parameter.`,
      };
    }
  }

  for (const key of REJECTED_QUERY_KEYS) {
    const candidate = url.searchParams.get(key);
    if (candidate && isValidUUID(candidate)) {
      return {
        artId: null,
        kind: 'group',
        message:
          'This link points to a group, not a single artwork. Please paste the artwork link instead.',
      };
    }
  }

  const pathState = getPathLookupState(url);
  if (pathState) return pathState;

  const rawMatches = trimmedInput.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
  );
  if (rawMatches?.length === 1) {
    if (hasGroupContext(trimmedInput)) {
      return {
        artId: null,
        kind: 'group',
        message:
          'This link looks like it belongs to a group. Please paste the artwork link instead.',
      };
    }

    return {
      artId: rawMatches[0],
      kind: 'artwork',
      message:
        'Detected a UUID in the link. Make sure it belongs to an artwork, not a group.',
    };
  }

  if (rawMatches && rawMatches.length > 1) {
    return {
      artId: null,
      kind: 'invalid',
      message:
        'We found more than one UUID in that link. Please use the public artwork link so we can identify the right artwork.',
    };
  }

  return {
    artId: null,
    kind: 'invalid',
    message:
      "We couldn't find a valid artwork UUID in that link. If you need help finding the artwork, contact us and we'll help.",
  };
}
