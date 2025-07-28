import { ColorKey } from '@/components/shared/FlairColorMap';
export interface DonationUsageCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: ColorKey;
  redirectTo: string;
}

import artsOlympiadLogo from '@/assets/donate/DonationUsageOrg-7thArtsOlympiadLogo.png';
import childArtMagazine from '@/assets/donate/DonationUsageOrg-ChildArtMagazine.png';
import worldChildrensFestival from '@/assets/donate/DonationUsageOrg-WCF.png';

export const donationUsageData: DonationUsageCard[] = [
  {
    id: 'arts-olympiad',
    title: 'Arts Olympiad',
    description:
      'Free school art programs inspiring creativity and healthy living in +40 low-income schools worldwide.',
    icon: artsOlympiadLogo,
    color: 'yellow',
    redirectTo: '/arts-olympiad',
  },
  {
    id: 'childart-magazine',
    title: 'ChildArt Magazine',
    description:
      'A quarterly magazine nurturing creativity, empathy, and global citizenship—ad-free since 1998.',
    icon: childArtMagazine,
    color: 'blue',
    redirectTo: '/childart-magazine',
  },
  {
    id: 'world-childrens-festival',
    title: 'World Childrens Festival',
    description:
      'A global celebration of young talent, hosted every four years at the U.S. National Mall. Free and open to all.',
    icon: worldChildrensFestival,
    color: 'red',
    redirectTo: '/world-childrens-festival',
  },
];
