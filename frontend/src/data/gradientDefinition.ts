import { IGradientDefinition } from '@/types/gradientDefinitionTypes';

export const OpinionatedGradients: IGradientDefinition = {
  xl: 'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.1)_60%,rgba(255,255,255,0.2)_100%)]',
  lg: 'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_70%,rgba(255,255,255,0.15)_100%)]',
  md: 'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-white/20 to-100%',
  sm: 'bg-black/70',
};
