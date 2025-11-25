import { TSpecialProjectGroup } from '@/types/SpecialProjectTypes';
import Wcf from '@/assets/home/WCF.webp';
import Swimmer from '@/assets/home/Swimmer.webp';
import Phoenix from '@/assets/home/Phoenix.webp';

export const specialProjectData: TSpecialProjectGroup = [
  {
    id: 1,
    image: Wcf,
    title: 'World Children’s Festival 2026',
    description:
      'A three-day celebration of American values of creativity, diversity, and unity',
    href: 'https://worldchildrensfestival.org/',
    color: 'red',
  },
  {
    id: 2,
    image: Swimmer,
    title: 'My Favorite Sport 2024',
    description: 'A global art contest to celebrate the Paris Games',
    href: 'https://myfavoritesport.org/',
    color: 'blue',
  },
  {
    id: 3,
    image: Phoenix,
    title: 'VR Heaven 2025/2026',
    description: 'Virtual Reality that brings Heaven to Earth',
    color: 'yellow',
  },
];
