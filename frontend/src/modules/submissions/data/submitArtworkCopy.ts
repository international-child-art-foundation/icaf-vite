import { GROUP_MAX_MEMBERS } from '@icaf/shared';

export type SubmitterFlow = 'adult_facilitator' | 'legal_guardian';
export type SubmissionQuantity = 'single' | 'group';

export type SubmitArtworkHeaderCopy = {
  description: string;
  kicker: string;
  title: string;
};

export type SubmitArtworkPageCopy = SubmitArtworkHeaderCopy & {
  artworkHelpText: string;
  submitLabel: string;
};

const submitterKickers = {
  adult_facilitator: 'Educators and group leaders',
  legal_guardian: 'Parents and legal guardians',
} as const satisfies Record<SubmitterFlow, string>;

const quantityTitles = {
  single: 'Submit artwork',
  group: 'Submit a group of artworks',
} as const satisfies Record<SubmissionQuantity, string>;

const submitArtworkDescriptions = {
  single: {
    adult_facilitator: 'Submit one artwork for a child in your care.',
    legal_guardian: 'Submit one artwork for your child.',
  },
  group: {
    adult_facilitator:
      'Submit several artworks together for a class, program, or group in your care.',
    legal_guardian:
      'Submit several artworks together for children in your family or care.',
  },
} as const satisfies Record<SubmissionQuantity, Record<SubmitterFlow, string>>;

export const submitArtworkPageCopy = {
  single: {
    artworkHelpText:
      'Click or tap the box to upload, review, and annotate one artwork.',
    submitLabel: 'Submit artwork',
  },
  group: {
    artworkHelpText: `Click or tap the box to upload, review, and annotate up to ${GROUP_MAX_MEMBERS} artworks.`,
    submitLabel: 'Submit artwork group',
  },
} as const satisfies Record<
  SubmissionQuantity,
  Pick<SubmitArtworkPageCopy, 'artworkHelpText' | 'submitLabel'>
>;

export function getSubmitArtworkHeaderCopy(
  submitterFlow: SubmitterFlow,
  quantity: SubmissionQuantity,
): SubmitArtworkHeaderCopy {
  return {
    description: submitArtworkDescriptions[quantity][submitterFlow],
    kicker: submitterKickers[submitterFlow],
    title: quantityTitles[quantity],
  };
}

export function getSubmitArtworkPageCopy(
  submitterFlow: SubmitterFlow,
  quantity: SubmissionQuantity,
): SubmitArtworkPageCopy {
  return {
    ...getSubmitArtworkHeaderCopy(submitterFlow, quantity),
    ...submitArtworkPageCopy[quantity],
  };
}
