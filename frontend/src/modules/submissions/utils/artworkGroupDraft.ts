import {
  GROUP_MAX_DESCRIPTION_LEN,
  GROUP_MAX_MEMBERS,
  GROUP_MAX_REGION_LEN,
  GROUP_MAX_STRING_LEN,
  GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN,
  GROUP_MAX_TITLE_LEN,
  MAX_ARTIST_AGE,
  MAX_DESCRIPTION_LEN,
  MAX_NAME_LEN,
  MAX_STRING_LEN,
  MAX_TITLE_LEN,
  S3_MAX_FILE_SIZE_BYTES,
  type SubmitArtworkToGroupRequest,
  type SubmitterRelationship,
  UPLOAD_FILE_TYPES,
} from '@icaf/shared';
import type {
  ArtworkDraft,
  ArtworkGroupInfo,
  ArtworkGroupSubmissionDraft,
  ArtworkGroupSubmissionErrors,
} from '@/modules/submissions/types/artworkGroupSubmission';
export { ARTWORK_GROUP_DRAFT_KEY } from './submissionDraftStorage';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;

export const initialArtworkGroupInfo: ArtworkGroupInfo = {
  class_name: '',
  country: '',
  description: '',
  notifications: true,
  region: '',
  theme: '',
  submitter_display_name: '',
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
    submitter_relationship: 'adult_facilitator',
    title: '',
  };
}

export const initialArtworkGroupSubmissionDraft: ArtworkGroupSubmissionDraft = {
  artworks: [createArtworkDraft()],
  certificationAccepted: false,
  digitalSignature: '',
  group: initialArtworkGroupInfo,
  submitterEmail: '',
  submitterFirstName: '',
  submitterLastName: '',
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
  options: {
    artworkDetailsMode?: 'basic' | 'full';
    requiresDigitalSignature?: boolean;
  } = {},
): ArtworkGroupSubmissionErrors {
  const artworkDetailsMode = options.artworkDetailsMode ?? 'full';
  const requiresDigitalSignature = options.requiresDigitalSignature ?? true;
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

  for (const [field, label] of [
    ['submitterFirstName', 'First name'],
    ['submitterLastName', 'Last name'],
  ] as const) {
    const value = draft[field].trim();
    if (!value) {
      errors[field] = `${label} is required.`;
    } else if (value.length > MAX_NAME_LEN) {
      errors[field] = `Use ${MAX_NAME_LEN} characters or less.`;
    }
  }

  if (
    draft.group.title.trim() &&
    draft.group.title.length > GROUP_MAX_TITLE_LEN
  ) {
    groupErrors.title = `Use ${GROUP_MAX_TITLE_LEN} characters or less.`;
  }

  if (
    draft.group.country.trim() &&
    draft.group.country.length > GROUP_MAX_STRING_LEN
  ) {
    groupErrors.country = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.region.trim() &&
    draft.group.region.length > GROUP_MAX_REGION_LEN
  ) {
    groupErrors.region = `Use ${GROUP_MAX_REGION_LEN} characters or less.`;
  }

  if (
    draft.group.class_name.trim() &&
    draft.group.class_name.length > GROUP_MAX_STRING_LEN
  ) {
    groupErrors.class_name = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
  }

  if (
    draft.group.submitter_display_name.trim() &&
    draft.group.submitter_display_name.length >
      GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN
  ) {
    groupErrors.submitter_display_name = `Use ${GROUP_MAX_SUBMITTER_DISPLAY_NAME_LEN} characters or less.`;
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

    if (artworkDetailsMode === 'full') {
      if (artwork.f_name.length > MAX_STRING_LEN) {
        itemErrors.f_name = `Use ${MAX_STRING_LEN} characters or less.`;
      }

      if (artwork.age.trim()) {
        const age = Number(artwork.age);
        if (!Number.isInteger(age) || age < 1 || age > MAX_ARTIST_AGE) {
          itemErrors.age = `Enter a whole number from 1 to ${MAX_ARTIST_AGE}.`;
        }
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
    errors.certificationAccepted =
      'Permissions and acknowledgements checkbox must be checked.';
  }
  if (requiresDigitalSignature) {
    if (!draft.digitalSignature.trim()) {
      errors.digitalSignature = 'Digital signature is required.';
    } else if (draft.digitalSignature.length > GROUP_MAX_STRING_LEN) {
      errors.digitalSignature = `Use ${GROUP_MAX_STRING_LEN} characters or less.`;
    }
  }

  if (Object.keys(groupErrors).length > 0) errors.group = groupErrors;
  if (Object.keys(artworkErrors).length > 0) errors.artworks = artworkErrors;

  return errors;
}

export function hasSubmissionErrors(errors: ArtworkGroupSubmissionErrors) {
  return Boolean(
    errors.root ||
    errors.submitterEmail ||
    errors.submitterFirstName ||
    errors.submitterLastName ||
    errors.certificationAccepted ||
    errors.digitalSignature ||
    (errors.group && Object.keys(errors.group).length > 0) ||
    (errors.artworks && Object.keys(errors.artworks).length > 0),
  );
}

export function createDigitalSignature(signature: string) {
  return signature.trim();
}

export function toArtworkRequest(
  artwork: ArtworkDraft,
  file: File,
  artId: string,
  digitalSignature: string,
  group: ArtworkGroupInfo,
  promotionalUse: boolean,
  options: {
    artworkDetailsMode?: 'basic' | 'full';
    submitterRelationship?: SubmitterRelationship;
  } = {},
): SubmitArtworkToGroupRequest {
  const fileType = getUploadFileType(file);
  if (!fileType) throw new Error('Unsupported file type.');
  const artworkDetailsMode = options.artworkDetailsMode ?? 'full';

  return {
    art_id: artId,
    age:
      artworkDetailsMode === 'full' && artwork.age.trim()
        ? Number(artwork.age)
        : undefined,
    country: group.country.trim() || undefined,
    description: artwork.description.trim() || undefined,
    f_name:
      artworkDetailsMode === 'full'
        ? artwork.f_name.trim() || undefined
        : undefined,
    file_type: fileType,
    digital_signature: digitalSignature,
    notifications: group.notifications,
    promotional_use: promotionalUse,
    region: group.region.trim() || undefined,
    submitter_relationship:
      options.submitterRelationship ?? artwork.submitter_relationship,
    theme: group.theme.trim() || undefined,
    title: artwork.title.trim() || undefined,
  };
}
