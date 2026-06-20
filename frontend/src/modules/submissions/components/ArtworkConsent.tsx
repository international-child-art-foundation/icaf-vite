import type { ChangeEvent } from 'react';
import type { SubmitterFlow } from '@/modules/submissions/data/submitArtworkCopy';

const consentText: Record<SubmitterFlow, string> = {
  legal_guardian:
    "I am the parent or legal guardian of the artist(s) submitting this artwork. I grant permission for the artwork to be displayed in ICAF's digital gallery and acknowledge that it may be reproduced and used for promotional, marketing, and related purposes in connection with ICAF's digital gallery and its programs. I also acknowledge that the identifying information I submit on this form will be displayed next to the artwork in ICAF's digital gallery. Such information includes the artwork image, title, description, artist first name, age, country, and region. I further acknowledge that I may revoke this consent at anytime by submitting an email to childart@icaf.org, and the artwork and all identifying information will be removed from ICAF's digital gallery and permanently deleted.",
  adult_facilitator:
    "I am a teacher, educator, art instructor, coach, program leader, or other adult facilitator working with the student artist(s) submitting this artwork and have obtained appropriate permission from each artist's parent or legal guardian for this submission. I grant permission for the artwork to be displayed in ICAF's digital gallery without artist attribution. I acknowledge that I may revoke this consent at anytime by submitting an email to childart@icaf.org, and the artwork will be removed from ICAF's digital gallery and permanently deleted.",
};

type ArtworkConsentProps = {
  checked: boolean;
  error?: string;
  flow: SubmitterFlow;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function ArtworkConsent({
  checked,
  error,
  flow,
  onChange,
}: ArtworkConsentProps) {
  return (
    <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      <input
        checked={checked}
        className="accent-secondary-blue mt-1 h-4 w-4 shrink-0"
        name="certificationAccepted"
        type="checkbox"
        onChange={onChange}
      />
      <span>
        {consentText[flow]}
        {error && (
          <span className="text-tertiary-red mt-1 block text-xs font-semibold">
            {error}
          </span>
        )}
      </span>
    </label>
  );
}
