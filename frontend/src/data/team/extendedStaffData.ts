import {
  IGroupsAndMembers,
  ITeamCardData,
} from '@/types/GroupsAndMembersTypes';
import { SpaceshipIcon } from '@/assets/shared/icons/SpaceshipIcon';
import { LightbulbIcon } from '@/assets/shared/icons/LightbulbIcon';

export const designerData: IGroupsAndMembers[] = [
  {
    name: 'Graphic Designer',
    members: [{ name: 'Jia Yu', link: 'https://jiayu-design.com/' }],
  },
  {
    name: 'UX/UI Manager',
    members: [{ name: 'Sarita Lewis', link: 'https://sarita-lewis.com/' }],
  },
  {
    name: 'UX Researcher ',
    members: [
      {
        name: 'Florencia Gatti ',
        link: 'https://www.linkedin.com/in/mflorencia-gatti/',
      },
    ],
  },
  {
    name: 'Graphic Artist',
    members: [{ name: 'Shuchen Wang' }],
  },
  {
    name: 'Graphics Manager',
    members: [
      { name: 'Marc Forton', link: 'https://mafmovement.com/' },
      { name: 'Jia Yu', link: 'https://jiayu-design.com/' },
    ],
  },
  {
    name: 'UX/UI Designer',
    members: [
      { name: 'Chih-Wei Huang' },
      {
        name: 'Florencia Gatti',
        link: 'https://www.linkedin.com/in/mflorencia-gatti/',
      },
    ],
  },
];

export const officerData: IGroupsAndMembers[] = [
  {
    name: 'Social Media Officer',
    members: [{ name: 'Xiaowei Wu' }],
  },
  {
    name: 'Arts Olympiad Officer',
    members: [{ name: 'Gina Golden' }],
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
    title: `Program and 
    Operations Officers`,
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
