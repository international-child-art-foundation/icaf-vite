import type { SubmitterRelationship, UploadFileType } from '@icaf/shared';

export type ArtworkGroupInfo = {
  class_name: string;
  country: string;
  description: string;
  group_type: string;
  notifications: boolean;
  region: string;
  teacher_display_name: string;
  title: string;
};

export type ArtworkDraft = {
  age: string;
  description: string;
  f_name: string;
  fileName?: string;
  fileSize?: number;
  fileType?: UploadFileType;
  id: string;
  previewDataUrl?: string;
  restoredFromDraft?: boolean;
  submitter_relationship: SubmitterRelationship;
  title: string;
};

export type ArtworkGroupSubmissionDraft = {
  artworks: ArtworkDraft[];
  certificationAccepted: boolean;
  group: ArtworkGroupInfo;
};

export type ArtworkGroupSubmissionErrors = {
  artworks?: Record<string, Partial<Record<keyof ArtworkDraft | 'file', string>>>;
  certificationAccepted?: string;
  group?: Partial<Record<keyof ArtworkGroupInfo, string>>;
  root?: string;
};
