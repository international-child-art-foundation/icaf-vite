import {
  IGroupsAndMembers,
  ITeamCardData,
} from '@/modules/content/types/GroupsAndMembersTypes';
import { SpaceshipIcon } from '@/shared/assets/icons/SpaceshipIcon';
import { LightbulbIcon } from '@/shared/assets/icons/LightbulbIcon';

export const designerData: IGroupsAndMembers[] = [
  {
    name: 'UX/UI Manager',
    members: [{ name: 'Sarita Lewis', link: 'https://sarita-lewis.com/' }],
  },
  {
    name: 'Graphic Artist',
    members: [
      {
        name: 'Mark Forton',
        link: 'https://mafmovement.com/',
      },
    ],
  },
  {
    name: 'Creative Director',
    members: [{ name: 'Jia Yu', link: 'https://jiayu-design.com/' }],
  },
  {
    name: 'Videographer',
    members: [{ name: 'Sarah Golder' }],
  },
  {
    name: 'Photographer',
    members: [{ name: 'Simona Chen' }],
  },
];

export const officerData: IGroupsAndMembers[] = [
  {
    name: 'Social Media',
    members: [{ name: 'Ashlyn Wenner' }],
  },
  {
    name: 'Business',
    members: [{ name: 'Louise Shen' }],
  },
  {
    name: 'International',
    members: [{ name: 'Jack Wilkerson' }],
  },
  {
    name: 'Communication',
    members: [{ name: 'Faith Antonioni' }],
  },
  {
    name: 'Art Contests',
    members: [{ name: 'Bryce Pfeiffer' }],
  },
];

export const planningOfficerData: IGroupsAndMembers[] = [
  {
    name: 'Planning Officers',
    members: [
      { name: 'Sanjana Bandaru' },
      { name: 'Camie Graves' },
      { name: 'Alexandre Green' },
      { name: 'Elizabeth Hay' },
      { name: 'Rijuta Kalantre' },
      { name: 'Connor Tarbert' },
      { name: 'Sebastian Zimmerman' },
    ],
  },
];

export const TeamCardData: ITeamCardData[] = [
  {
    title: 'Creative Officers',
    subtitle: 'Bringing vision to life.',
    color: 'red',
    Icon: LightbulbIcon,
    groupsOfMembers: designerData,
  },
  {
    title: `Strategic Officers`,
    subtitle: 'Managing operations and activities.',
    color: 'green',
    Icon: SpaceshipIcon,
    groupsOfMembers: officerData,
  },
  {
    title: 'Planning Officers',
    subtitle: "Facilitating the 2026 World Children's Festival.",
    color: 'primaryBlue',
    Icon: SpaceshipIcon,
    groupsOfMembers: planningOfficerData,
    memberDisplay: 'list',
  },
];
