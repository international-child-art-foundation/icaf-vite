import {
  FORBIDDEN_CHARS_SINGLELINE,
  MAX_NAME_LEN,
  type UserEntity,
} from "@icaf/shared";

type ProfileNames = Pick<UserEntity, "f_name" | "l_name">;

type SubmitterNameBody = {
  submitter_first_name?: unknown;
  submitter_last_name?: unknown;
};

export type ProfileNameUpdates = {
  f_name?: string;
  l_name?: string;
};

function hasProfileName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateCollectedName(field: string, value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required`;
  }
  if (value.length > MAX_NAME_LEN) {
    return `${field} must be ${MAX_NAME_LEN} characters or less`;
  }
  if (FORBIDDEN_CHARS_SINGLELINE.test(value)) {
    return `${field} contains invalid characters`;
  }
  return null;
}

export function validateMissingProfileNames(
  profile: ProfileNames,
  body: SubmitterNameBody,
): string[] {
  const errors: string[] = [];

  if (!hasProfileName(profile.f_name)) {
    const error = validateCollectedName("submitter_first_name", body.submitter_first_name);
    if (error) errors.push(error);
  }

  if (!hasProfileName(profile.l_name)) {
    const error = validateCollectedName("submitter_last_name", body.submitter_last_name);
    if (error) errors.push(error);
  }

  return errors;
}

export function getMissingProfileNameUpdates(
  profile: ProfileNames,
  body: SubmitterNameBody,
): ProfileNameUpdates {
  return {
    ...(!hasProfileName(profile.f_name) &&
      typeof body.submitter_first_name === "string" && {
        f_name: body.submitter_first_name.trim(),
      }),
    ...(!hasProfileName(profile.l_name) &&
      typeof body.submitter_last_name === "string" && {
        l_name: body.submitter_last_name.trim(),
      }),
  };
}
