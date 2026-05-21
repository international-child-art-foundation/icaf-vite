import {
  GROUP_MAX_DESCRIPTION_LEN,
  GROUP_MAX_MEMBERS,
  GROUP_MAX_STRING_LEN,
  GROUP_MAX_TITLE_LEN,
  MAX_DESCRIPTION_LEN,
  MAX_STRING_LEN,
  MAX_TITLE_LEN,
  S3_MAX_FILE_SIZE_BYTES,
  UPLOAD_FILE_TYPES,
} from '@icaf/shared';
import type { SubmitArtworkToGroupRequest } from '@/api/guardian';
import type {
  ArtworkDraft,
  ArtworkGroupInfo,
  ArtworkGroupSubmissionDraft,
  ArtworkGroupSubmissionErrors,
} from '@/modules/submissions/types/artworkGroupSubmission';

export const ARTWORK_GROUP_DRAFT_KEY = 'icaf.submitArtworkGroupDraft.v1';
export const RELEASE_TEXT =
  'ICAF artwork group submission release accepted by the submitter.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

export const initialArtworkGroupInfo: ArtworkGroupInfo = {
  class_name: '',
  country: '',
  description: '',
  group_type: 'classroom',
  notifications: true,
  region: '',
  guardian_display_name: '',
  title: '',
};

function createDraftId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `artwork-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createArtworkDraft(): ArtworkDraft {
  return {
    age: '',
    description: '',
    f_name: '',
    id: createDraftId(),
    submitter_relationship: 'teacher',
    title: '',
  };
}

export const initialArtworkGroupSubmissionDraft: ArtworkGroupSubmissionDraft = {
  artworks: [createArtworkDraft()],
  certificationAccepted: false,
  group: initialArtworkGroupInfo,
  submitterEmail: '',
};

const allowedFileTypes = new Set<string>(UPLOAD_FILE_TYPES);

export function getUploadFileType(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension && allowedFileTypes.has(extension)
    ? (extension as (typeof UPLOAD_FILE_TYPES)[number])
    : undefined;
}

export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

export function validateArtworkGroupSubmission(
  draft: ArtworkGroupSubmissionDraft,
  files: Record<string, File | undefined>,
): ArtworkGroupSubmissionErrors {
  const errors: ArtworkGroupSubmissionErrors = {};
  const groupErrors: ArtworkGroupSubmissionErrors['group'] = {};
  const artworkErrors: NonNullable<ArtworkGroupSubmissionErrors['artworks']> =
    {};

  const submitterEmail = draft.submitterEmail.trim();
  if (!submitterEmail) {
    errors.submitterEmail = 'Email is required.';
  } else if (submitterEmail.length > MAX_EMAIL_LEN) {
    errors.submitterEmail = `Use ${MAX_EMAIL_LEN} characters or less.`;
  } else if (!EMAIL_PATTERN.test(submitterEmail)) {
    errors.submitterEmail = 'Enter a valid email address.';
  }

  if (!draft.group.title.trim()) {
    groupErrors.title = 'Group title is required.';
  } else if (draft.group.title.length > GROUP_MAX_TITLE_LEN) {
    groupErrors.title = `Use ${GROUP_MAX_TITLE_LEN} characters or less.`;
  }

  if (!draft.group.country.trim()) {
    groupErrors.country = 'Country is required.';
  } else if (draft.group.country.length > GROUP_MAX_STRING_LEN) {
    groupErrors.country = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.region.trim() &&
    draft.group.region.length > GROUP_MAX_STRING_LEN
  ) {
    groupErrors.region = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.class_name.trim() &&
    draft.group.class_name.length > GROUP_MAX_STRING_LEN
  ) {
    groupErrors.class_name = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.guardian_display_name.trim() &&
    draft.group.guardian_display_name.length > GROUP_MAX_STRING_LEN
  ) {
    groupErrors.guardian_display_name = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.description.trim() &&
    draft.group.description.length > GROUP_MAX_DESCRIPTION_LEN
  ) {
    groupErrors.description = `Use ${GROUP_MAX_DESCRIPTION_LEN} characters or less.`;
  }

  if (draft.artworks.length < 1) {
    errors.root = 'Add at least one artwork.';
  }

  if (draft.artworks.length > GROUP_MAX_MEMBERS) {
    errors.root = `Artwork groups can include up to ${GROUP_MAX_MEMBERS} artworks.`;
  }

  draft.artworks.forEach((artwork) => {
    const itemErrors: Partial<Record<keyof ArtworkDraft | 'file', string>> = {};
    const file = files[artwork.id];

    if (!file) {
      itemErrors.file = 'Add an image to submit.';
    } else {
      const fileType = getUploadFileType(file);
      if (!fileType) {
        itemErrors.file = `Use ${UPLOAD_FILE_TYPES.join(', ')}.`;
      } else if (file.size > S3_MAX_FILE_SIZE_BYTES) {
        itemErrors.file = `File must be ${formatFileSize(S3_MAX_FILE_SIZE_BYTES)} or less.`;
      }
    }

    if (artwork.title.length > MAX_TITLE_LEN) {
      itemErrors.title = `Use ${MAX_TITLE_LEN} characters or less.`;
    }

    if (artwork.f_name.length > MAX_STRING_LEN) {
      itemErrors.f_name = `Use ${MAX_STRING_LEN} characters or less.`;
    }

    if (artwork.age.trim()) {
      const age = Number(artwork.age);
      if (!Number.isInteger(age) || age < 1 || age > 120) {
        itemErrors.age = 'Enter a whole number from 1 to 120.';
      }
    }

    if (
      artwork.description.trim() &&
      artwork.description.length > MAX_DESCRIPTION_LEN
    ) {
      itemErrors.description = `Use ${MAX_DESCRIPTION_LEN} characters or less.`;
    }

    if (Object.keys(itemErrors).length > 0) {
      artworkErrors[artwork.id] = itemErrors;
    }
  });

  if (!draft.certificationAccepted) {
    errors.certificationAccepted = 'Certification is required.';
  }

  if (Object.keys(groupErrors).length > 0) errors.group = groupErrors;
  if (Object.keys(artworkErrors).length > 0) errors.artworks = artworkErrors;

  return errors;
}

export function hasSubmissionErrors(errors: ArtworkGroupSubmissionErrors) {
  return Boolean(
    errors.root ||
    errors.submitterEmail ||
    errors.certificationAccepted ||
    (errors.group && Object.keys(errors.group).length > 0) ||
    (errors.artworks && Object.keys(errors.artworks).length > 0),
  );
}

// TODO: Replace with PDF parser when release form is created,
// uncomment digest/encodedRelease (done for local testing)
export async function createReleaseHash() {
  // const encodedRelease = new TextEncoder().encode(RELEASE_TEXT);
  // const digest = await crypto.subtle.digest('SHA-256', encodedRelease);
  await Promise.resolve();
  return Array.from(new Uint8Array(32))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function toArtworkRequest(
  artwork: ArtworkDraft,
  file: File,
  releaseHash: string,
  group: ArtworkGroupInfo,
): SubmitArtworkToGroupRequest {
  const fileType = getUploadFileType(file);
  if (!fileType) throw new Error('Unsupported file type.');

  return {
    age: artwork.age.trim() ? Number(artwork.age) : undefined,
    country: group.country.trim(),
    description: artwork.description.trim() || undefined,
    f_name: artwork.f_name.trim() || undefined,
    file_type: fileType,
    notifications: group.notifications,
    region: group.region.trim() || undefined,
    release_hash: releaseHash,
    submitter_relationship: artwork.submitter_relationship,
    title: artwork.title.trim() || undefined,
  };
}
