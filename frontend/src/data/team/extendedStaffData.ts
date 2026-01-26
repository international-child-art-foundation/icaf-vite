import {
  IGroupsAndMembers,
  ITeamCardData,
} from '@/types/GroupsAndMembersTypes';
import { SpaceshipIcon } from '@/assets/shared/icons/SpaceshipIcon';
import { LightbulbIcon } from '@/assets/shared/icons/LightbulbIcon';

export const designerData: IGroupsAndMembers[] = [
  {
    name: 'UX/UI Manager',
    members: [{ name: 'Sarita Lewis', link: 'https://sarita-lewis.com/' }],
  },
  {
    name: 'UX Researcher',
    members: [
      {
        name: 'Florencia Gatti',
        link: 'https://www.linkedin.com/in/mflorencia-gatti/',
      },
    ],
  },
  {
    name: 'Graphic Artist',
    members: [{ name: 'Shuchen Wang', link: 'https://shuchenwang.com/about' }],
  },
  {
    name: 'Creative Directors',
    members: [
      { name: 'Mark Forton', link: 'https://mafmovement.com/' },
      { name: 'Jia Yu', link: 'https://jiayu-design.com/' },
    ],
  },
];

export const officerData: IGroupsAndMembers[] = [
  {
    name: 'Social Media Officer',
    members: [{ name: 'Ashley Bostic' }],
  },
  {
    name: 'Program & Event Officers',
    members: [
      { name: 'Camie Graves' },
      { name: 'Sylvia Tong' },
      { name: 'Jack Wesley Wilkerson' },
    ],
  },
  {
    name: 'Writer & Researcher',
    members: [{ name: 'Ava Saunders' }],
  },
  {
    name: 'Communications Officer',
    members: [{ name: 'Faith Antonioni' }],
  },
];

export const developerData: IGroupsAndMembers[] = [
  {
    name: 'Front-end Developer',
    members: [{ name: 'Jiayun Yan' }],
  },
  {
    name: 'Front-end Developer',
    members: [{ name: 'Sam Bolton' }],
  },
  {
    name: 'Front-end Developer',
    members: [{ name: 'Yuting Shen' }],
  },
  {
    name: 'Front-end Developer',
    members: [{ name: 'Emma Wang' }],
  },
  {
    name: 'Full-stack Developer',
    members: [{ name: 'Shenqian Wen' }],
  },
];

export const TeamCardData: ITeamCardData[] = [
  {
    title: 'Designers',
    subtitle: 'Bringing ICAF’s vision to life.',
    color: 'red',
    Icon: LightbulbIcon,
    groupsOfMembers: designerData,
  },
  {
    title: `Program Officers`,
    subtitle: 'Helping ICAF’s operations and activities',
    color: 'green',
    Icon: SpaceshipIcon,
    groupsOfMembers: officerData,
  },
  {
    title: 'Developers and Engineers',
    subtitle: 'Maintaining ICAF’s digital platforms.',
    color: 'primaryBlue',
    Icon: SpaceshipIcon,
    groupsOfMembers: developerData,
  },
];
