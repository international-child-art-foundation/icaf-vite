import type { SubmitterRelationship } from '@icaf/shared';

export type ArtworkGroupInfo = {
  class_name: string;
  country: string;
  description: string;
  group_type: string;
  notifications: boolean;
  region: string;
  guardian_display_name: string;
  title: string;
};

export type ArtworkDraft = {
  age: string;
  description: string;
  f_name: string;
  id: string;
  submitter_relationship: SubmitterRelationship;
  title: string;
};

export type ArtworkGroupSubmissionDraft = {
  artworks: ArtworkDraft[];
  certificationAccepted: boolean;
  group: ArtworkGroupInfo;
};

export type StoredArtworkGroupSubmissionDraft = Pick<
  ArtworkGroupSubmissionDraft,
  'certificationAccepted' | 'group'
>;

export type ArtworkGroupSubmissionErrors = {
  artworks?: Record<
    string,
    Partial<Record<keyof ArtworkDraft | 'file', string>>
  >;
  certificationAccepted?: string;
  group?: Partial<Record<keyof ArtworkGroupInfo, string>>;
  root?: string;
};
