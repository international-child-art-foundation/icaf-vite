import { TStaffData } from '@/types/TeamPageTypes';
import AshfaqIshaqImg from '@/assets/team/AshfaqIshaq.webp';
import KattyGueramiImg from '@/assets/team/KattyGuerami.webp';
import NicoleBrownImg from '@/assets/team/NicoleBrown.webp';
import MiaSmithImg from '@/assets/team/MiaSmith.webp';
import AnjayStoneImg from '@/assets/team/AnjayStone.webp';
import NoahZarankaImg from '@/assets/team/NoahZaranka.webp';

export const staffData: TStaffData = [
  {
    src: AshfaqIshaqImg,
    name: 'Dr. Ashfaq Ishaq',
    title: 'Executive Director',
  },
  {
    src: KattyGueramiImg,
    name: 'Katty Guerami',
    title: 'Director of Community Relations',
  },
  // TODO: Add image for Ana
  {
    name: 'Ana Alberdi',
    title: 'Assitant Editor, ChildArt Magazine',
  },
  {
    src: NicoleBrownImg,
    name: 'Nicole Brown, Esq.',
    title: 'Counsel',
  },
  {
    src: MiaSmithImg,
    name: 'Mia Smith',
    title: 'Manager and Assistant Editor',
  },
  {
    src: AnjayStoneImg,
    name: 'Anjay Stone',
    title: 'Manager and Assistant Editor',
  },
  {
    src: NoahZarankaImg,
    name: 'Noah Zaranka',
    title: 'IT Manager and Lead Developer',
    link: 'https://noahz.dev',
  },
];
