import Money from '@/assets/donate/Money.svg';
import Earth from '@/assets/donate/Earth.svg';
import Donator from '@/assets/donate/Donator.svg';


export interface DonationUsageItem {
    id: string;
    title: string;
    description: string;
    icon: string; // SVG file path
    borderColor: string;
    iconColor: string;
}

export const DonationUsageData: DonationUsageItem[] = [
    {
        id: 'direct-impact',
        title: 'Direct Impact',
        description: '9 of every 10 dollars we receive go directly to our free Art Programs and resources.',
        icon: Money,
        borderColor: '#22C55E', // Green
        iconColor: '#22C55E'
    },
    {
        id: 'program-outreach',
        title: 'Program Outreach',
        description: 'We support children in USA and in +80 countries through in-country partnerships.',
        icon: Earth,
        borderColor: '#3B82F6', // Blue
        iconColor: '#3B82F6'
    },
    {
        id: 'theory-of-change',
        title: 'Theory of Change',
        description: 'We foster personal growth as artist-athletes and cultivate social impact through creative empathy.',
        icon: Donator,
        borderColor: '#EF4444', // Red
        iconColor: '#EF4444'
    }
];
