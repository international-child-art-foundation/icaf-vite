import {
  IGroupsAndMembers,
  ITeamCardData,
} from '@/modules/content/types/GroupsAndMembersTypes';
import { LightbulbIcon } from '@/shared/assets/icons/LightbulbIcon';

export const creativeOfficerData: IGroupsAndMembers[] = [
  {
    name: 'UX/UI Manager',
    members: [{ name: 'Sarita Lewis', link: 'https://sarita-lewis.com/' }],
  },
  {
    name: 'Creative Director',
    members: [
      {
        name: 'Mark Forton',
        link: 'https://mafmovement.com/',
      },
    ],
  },
  {
    name: 'Videographer',
    members: [{ name: 'Sarah Golder' }],
  },
  {
    name: 'Communication Officer',
    members: [{ name: 'Faith Antonioni' }],
  },
];

export const TeamCardData: ITeamCardData[] = [
  {
    title: 'Creative Officers',
    subtitle: 'Bringing vision to life.',
    color: 'red',
    Icon: LightbulbIcon,
    groupsOfMembers: creativeOfficerData,
  },
];
