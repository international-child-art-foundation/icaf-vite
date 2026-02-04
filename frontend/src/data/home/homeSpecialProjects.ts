import { TSpecialProjectGroup } from '@/types/SpecialProjectTypes';
import Wcf from '@/assets/home/WCF.webp';
import Swimmer from '@/assets/home/Swimmer.webp';
import Phoenix from '@/assets/home/Phoenix.webp';

export const specialProjectData: TSpecialProjectGroup = [
  {
    id: 1,
    image: Wcf,
    title: '7th World Children’s Festival ',
    description:
      "A three-day celebration of children's creativity and America's 250th anniversary on the National Mall",
    href: 'https://worldchildrensfestival.org/',
    color: 'red',
  },
  {
    id: 2,
    image: Swimmer,
    title: 'My Favorite Sport',
    description:
      "An online art contest for young people's interactive engagement with the sports that inspire them",
    href: 'https://myfavoritesport.org/',
    color: 'blue',
  },
  {
    id: 3,
    image: Phoenix,
    title: 'VR Heaven 2026',
    description: 'Virtual Reality that brings Heaven to Earth',
    color: 'yellow',
  },
];
