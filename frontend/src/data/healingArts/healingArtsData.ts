import { IGoalCard, IResourceLink } from '@/types/HealingArtsTypes';
import { LeafIcon } from '@/assets/shared/icons/LeafIcon';
import { HeartsIcon } from '@/assets/shared/icons/HeartsIcon';
import { HeartHeadIcon } from '@/assets/shared/icons/HeartHeadIcon';
import { SmallGroupIcon } from '@/assets/shared/icons/SmallGroupIcon';

export const GoalCards: IGoalCard[] = [
  {
    id: 'look-ahead',
    Icon: LeafIcon,
    color: 'blue',
    title: 'Look Ahead',
    description:
      'Helping communities focus on future needs, not just what was lost. ',
  },
  {
    id: 'rebuild-bonds',
    Icon: HeartsIcon,
    color: 'yellow',
    title: 'Rebuild Bonds',
    description:
      "Deepening children's emotional ties to their hometowns through creativity. ",
  },
  {
    id: 'strengthen-families',

    Icon: SmallGroupIcon,
    color: 'green',
    title: 'Strengthen Families',
    description:
      'Supporting the family unit and using schools as recovery hubs. ',
  },
  {
    id: 'restore-resilience',

    Icon: HeartHeadIcon,
    color: 'red',
    title: 'Restore Resilience',
    description:
      'Accelerating emotional healing to nurture optimism and leadership. ',
  },
];

export const ResourceLinks: IResourceLink[] = [
  {
    id: 'thanksgiving-in-palestine',
    title: 'Thanksgiving in Palestine',
    type: 'PDF',
    href: '/documents/thanksgiving_in_palestine.pdf',
  },
  // TODO: Replace placeholder
  // Find pakistan earthquake relief effort pdf
  {
    id: 'placeholder',
    title: 'Pakistan’s Earthquake Relief Efforts',
    type: 'PDF',
  },
  {
    id: 'katrina-healing-arts',
    title: 'Katrina Healing Arts',
    type: 'Teacher’s Perspective',
    href: "/documents/Katrina Healing Arts Program - A Schoolteacher's Perspective.pdf",
  },
  {
    id: 'who-mental-health',
    title: 'WHO: Expanding Mental Health Awareness in Youth',
    type: 'PDF',
    href: '/documents/Expanding Awareness of Mental Health in Childhood and Adolescence.pdf',
  },
  {
    id: 'destruction-reconstruction-prevention',
    title: 'Destruction, Reconstruction & Prevention – World Bank',
    type: 'PDF',
    href: '/documents/Destruction, Reconstruction & Prevention.pdf',
  },
];
