import Money from '@/assets/donate/Money.svg';
import Earth from '@/assets/donate/Earth.svg';
import Donator from '@/assets/donate/Donator.svg';
import { ColorKey } from '@/components/shared/FlairColorMap';

export interface DonationUsageItem {
  id: string;
  title: string;
  description: string;
  icon: string; // SVG file path
  color: ColorKey;
}

export const DonationUsageData: DonationUsageItem[] = [
  {
    id: 'direct-impact',
    title: 'Direct Impact',
    description:
      '9 of every 10 dollars we receive go directly to our free Art Programs and resources.',
    icon: Money,
    color: 'green',
  },
  {
    id: 'program-outreach',
    title: 'Program Outreach',
    description:
      'We support children in USA and in +80 countries through in-country partnerships.',
    icon: Earth,
    color: 'blue',
  },
  {
    id: 'theory-of-change',
    title: 'Theory of Change',
    description:
      'We foster personal growth as artist-athletes and cultivate social impact through creative empathy.',
    icon: Donator,
    color: 'red',
  },
];
