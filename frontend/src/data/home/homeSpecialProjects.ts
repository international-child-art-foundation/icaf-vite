import { TSpecialProjectGroup } from '@/types/SpecialProjectTypes';
import Wcf from '@/assets/home/WCF.png';
import Swimmer from '@/assets/home/Swimmer.png';
import Phoenix from '@/assets/home/Phoenix.png';

export const specialProjectData: TSpecialProjectGroup = [
  {
    id: 1,
    image: Wcf,
    title: 'World Children’s Festival 2025',
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
    color: 'red',
  },
  {
    id: 3,
    image: Phoenix,
    title: 'VR Heaven 2025/2026',
    description: 'Virtual Reality that brings Heaven to Earth',
    href: 'https://worldchildrensfestival.org/',
    color: 'red',
  },
];
