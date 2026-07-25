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
    aliases: ["WORLD_CHILDREN'S_FESTIVAL"],
    decorated: false,
    videoSrc: largeMedia.worldChildrensFestival,
    durationSeconds: 4,
    palette: {
      primary: '#3C3B6E',
      secondary: '#B22234',
    },
  },
  {
    aliases: ['ARTS_OLYMPIAD'],
    decorated: false,
    videoSrc: largeMedia.artsOlympiad,
    palette: {
      primary: '#fec342',
    },
  },
];
