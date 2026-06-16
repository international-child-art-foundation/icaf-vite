import type { ThemeVisualDefinition } from './types';
import { largeMedia } from '@/shared/lib/largeMedia';

export const customThemeVisuals: ThemeVisualDefinition[] = [
  {
    aliases: ['CHERRY_BLOSSOM', 'CHERRYBLOSSOM'],
    decorated: true,
    palette: {
      background: '#fff7fb',
      foreground: '#ffffff',
    },
  },
  {
    aliases: ['FOURTH_OF_JULY'],
    decorated: false,
    videoSrc: largeMedia.fourthOfJuly,
    mirrored: true,
    palette: {
      background: '#f8fafc',
      foreground: '#2d4069',
    },
  },
];
