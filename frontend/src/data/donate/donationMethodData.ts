import { IAccordionCard } from '@/types/AccordionCardTypes';
import { HandshakeIcon } from '@/assets/shared/icons/HandshakeIcon';
import { GiftIcon } from '@/assets/shared/icons/GiftIcon';
import { UsersIcon } from '@/assets/shared/icons/UsersIcon';

export const donationMethodData: IAccordionCard[] = [
  {
    id: 'donor-advised-funds',
    title: 'Donor Advised Funds',
    shortDescription: 'Make a tax-smart gift through your Donor Advised Fund.',
    extendedDescription:
      "Use any DAF giving platform, such as Fidelity Charitable, Private Bank of America or DAF Giving 360. International Child Art Foundation's EIN (Federal Tax ID) is 52-2032649.",
    Icon: HandshakeIcon,
    color: 'red',
    backgroundColor: true,
  },
  {
    id: 'legacy-giving',
    title: 'Legacy Giving',
    shortDescription: 'Leave a lasting legacy by including ICAF in your will.',
    extendedDescription: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value:
              'Support us while gaining tax benefits for you and your family.',
          },
        ],
      },
      {
        type: 'bullet',
        children: [
          {
            type: 'text',
            value: 'Reduce estate taxes through a charitable bequest to ICAF.',
          },
        ],
      },
      {
        type: 'bullet',
        children: [
          {
            type: 'text',
            value:
              'Name ICAF as a beneficiary of your 401(k), IRA, or life insurance policy.',
          },
        ],
      },
      {
        type: 'bullet',
        children: [
          {
            type: 'text',
            value:
              'Set up a charitable gift annuity to provide ICAF with a steady income.',
          },
        ],
      },
      {
        type: 'bullet',
        children: [
          {
            type: 'text',
            value:
              'Establish a charitable remainder trust that offers income to your family, with the remainder going to ICAF.',
          },
        ],
      },
    ],
    Icon: GiftIcon,
    color: 'yellow',
    backgroundColor: true,
  },
  {
    id: 'corporate-matching',
    title: 'Corporate Matching',
    shortDescription:
      'Double your impact. Ask your employer to match your donation.',
    extendedDescription:
      'Many companies match employee donations as part of their social responsibility programs. Check with your employer, your gift to ICAF could be doubled or even tripled, at no extra cost to you.',
    Icon: UsersIcon,
    color: 'blue',
    backgroundColor: true,
  },
];
