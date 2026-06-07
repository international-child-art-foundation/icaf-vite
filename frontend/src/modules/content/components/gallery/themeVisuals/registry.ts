import type { ThemeVisualDefinition } from './types';
import { CherryBlossomVisual } from './visuals/CherryBlossomVisual';
import { FourthOfJulyVisual } from '@/modules/content/components/gallery/themeVisuals/visuals/FourthOfJulyVisual';

export const customThemeVisuals: ThemeVisualDefinition[] = [
  {
    aliases: ['CHERRY_BLOSSOM', 'CHERRYBLOSSOM'],
    decorated: true,
    Visual: CherryBlossomVisual,
  },
  {
    aliases: ['FOURTH_OF_JULY'],
    decorated: false,
    Visual: FourthOfJulyVisual,
  },
];
