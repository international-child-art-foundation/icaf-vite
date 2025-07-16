export interface DonationUsageCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    actionIcon: string;
    hoverColor: string;
    redirectTo: string;
}

import artsOlympiadLogo from '@/assets/donate/DonationUsage-7thArtsOlympiadLogo.png';
import childArtMagazine from '@/assets/donate/DonationUsage-ChildArtMagazine.png';
import worldChildrensFestival from '@/assets/donate/DonationUsage-WCF.png';
import arrowCircleUp from '@/assets/donate/DonationUsage-arrow_circle_up.svg';

export const donationUsageData: DonationUsageCard[] = [
    {
        id: 'arts-olympiad',
        title: 'Arts Olympiad',
        description: 'Free school art programs inspiring creativity and healthy living in +40 low-income schools worldwide.',
        icon: artsOlympiadLogo,
        actionIcon: arrowCircleUp,
        hoverColor: '#F97316', // Orange
        redirectTo: '/arts-olympiad'
    },
    {
        id: 'childart-magazine',
        title: 'ChildArt Magazine',
        description: 'A quarterly magazine nurturing creativity, empathy, and global citizenship—ad-free since 1998.',
        icon: childArtMagazine,
        actionIcon: arrowCircleUp,
        hoverColor: '#3B82F6', // Blue
        redirectTo: '/childart-magazine'
    },
    {
        id: 'world-childrens-festival',
        title: 'World Childrens Festival',
        description: 'A global celebration of young talent, hosted every four years at the U.S. National Mall. Free and open to all.',
        icon: worldChildrensFestival,
        actionIcon: arrowCircleUp,
        hoverColor: '#EF4444', // Red
        redirectTo: '/world-childrens-festival'
    }
];
