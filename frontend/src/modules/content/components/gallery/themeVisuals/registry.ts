import type { ThemeVisualDefinition } from './types';
import { largeMedia } from '@/shared/lib/largeMedia';

export const customThemeVisuals: ThemeVisualDefinition[] = [
  {
    aliases: ['CHERRY_BLOSSOM', 'CHERRYBLOSSOM'],
    decorated: true,
    palette: {
      primary: '#FEC342',
    },
  },
  {
    aliases: ['FOURTH_OF_JULY'],
    decorated: false,
    videoSrc: largeMedia.fourthOfJuly,
    mirrored: true,
    palette: {
      primary: '#B22234',
      secondary: '#3C3B6E',
    },
  },
  {
    aliases: ['ARTS_OLYMPIAD'],
    decorated: false,
    palette: {
      primary: '#fec342',
    },
  },
];
