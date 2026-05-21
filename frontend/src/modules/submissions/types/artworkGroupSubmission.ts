import type { SubmitterRelationship } from '@icaf/shared';

export type ArtworkGroupInfo = {
  class_name: string;
  country: string;
  description: string;
  group_type: string;
  notifications: boolean;
  region: string;
  theme_family: string;
  theme_instance: string;
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
  submitterEmail: string;
};

export type StoredArtworkGroupSubmissionDraft = Pick<
  ArtworkGroupSubmissionDraft,
  'certificationAccepted' | 'group' | 'submitterEmail'
>;

export type ArtworkGroupSubmissionErrors = {
  artworks?: Record<
    string,
    Partial<Record<keyof ArtworkDraft | 'file', string>>
  >;
  certificationAccepted?: string;
  group?: Partial<Record<keyof ArtworkGroupInfo, string>>;
  root?: string;
  submitterEmail?: string;
};
