import handshake from '@/assets/donate/handshake.svg';
import gift from '@/assets/donate/gift.svg';
import users from '@/assets/donate/users.svg';

export interface DonationWay {
    id: string;
    title: string;
    description: string;
    expandedDescription: string | string[];
    icon: string;
    borderColor: string;
    iconColor: string;
}

export const donationWayData: DonationWay[] = [
    {
        id: 'donor-advised-funds',
        title: 'Donor Advised Funds',
        description: 'Make a tax-smart gift through your Donor Advised Fund.',
        expandedDescription: 'Use any DAF giving platform, such as Fidelity Charitable, Private Bank of America or DAF Giving 360. International Child Art Foundation\'s EIN (Federal Tax ID) is 52-2032649.',
        icon: handshake,
        borderColor: 'border-red-500',
        iconColor: 'text-red-500'
    },
    {
        id: 'legacy-giving',
        title: 'Legacy Giving',
        description: 'Leave a lasting legacy by including ICAF in your will.',
        expandedDescription: [
            'Support us while gaining tax benefits for you and your family.',
            'Reduce estate taxes through a charitable bequest to ICAF.',
            'Name ICAF as a beneficiary of your 401k or life insurance policy.',
            'Set up a charitable gift annuity to provide ICAF with a steady income.',
            'Establish a charitable remainder trust that offers income to your family, with the remainder going to ICAF.'
        ],
        icon: gift,
        borderColor: 'border-orange-500',
        iconColor: 'text-orange-500'
    },
    {
        id: 'corporate-matching',
        title: 'Corporate Matching',
        description: 'Double your impact. Ask your employer to match your donation.',
        expandedDescription: 'Many companies match employee donations as part of their social responsibility programs. Check with your employer, your gift to ICAF could be doubled or even tripled, at no extra cost to you.',
        icon: users,
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-500'
    }
];