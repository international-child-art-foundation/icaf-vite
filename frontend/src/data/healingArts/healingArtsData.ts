import { IGoalCard, IResourceLink } from '@/types/HealingArtsTypes';
import { LeafIcon } from '@/assets/shared/icons/LeafIcon';
import { HeartsIcon } from '@/assets/shared/icons/HeartsIcon';
import { HeartHeadIcon } from '@/assets/shared/icons/HeartHeadIcon';
import { SmallGroupIcon } from '@/assets/shared/icons/SmallGroupIcon';
import artAsHealing from '@/assets/healingArts/art-as-a-source-of-healing.mp4';

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
    title: 'Palestine — Thanksgiving in Palestine',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/thanksgiving_in_palestine.pdf',
  },
  {
    id: 'pakistan-earthquake-relief',
    title: 'Pakistan — Earthquake Relief Efforts',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/Pakistan - Earthquake Relief Efforts.pdf',
  },
  {
    id: 'katrina-healing-arts',
    title: 'Katrina — Healing Arts',
    behavior: 'link',
    fileType: 'Teacher’s Perspective',
    href: "/documents/Katrina Healing Arts Program - A Schoolteacher's Perspective.pdf",
  },
  {
    id: 'who-mental-health',
    title: 'WHO — Expanding Mental Health Awareness in Youth',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/Expanding Awareness of Mental Health in Childhood and Adolescence.pdf',
  },
  {
    id: 'destruction-reconstruction-prevention',
    title: 'World Bank — Destruction, Reconstruction & Prevention',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/Destruction, Reconstruction & Prevention.pdf',
  },
  {
    id: 'chile-art-healing',
    title: 'Chile — Art as a Source of Healing',
    behavior: 'modal',
    fileType: 'Video',
    href: artAsHealing,
  },
  {
    id: 'sichuan-healing-arts',
    title: 'China — Sichuan Healing Arts Program',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/Sichuan Healing Arts.pdf',
  },
  {
    id: 'haiti-healing-arts',
    title: 'Haiti — Healing Arts Guidelines',
    behavior: 'link',
    fileType: 'PDF',
    href: '/documents/Haiti Healing Arts - Guidelines_ICAF.pdf',
  },
];
