export const ribbonPaths = {
  Ellipse: {
    top: 'M0,0 L0,0.1 Q0.5,0.25 1,0.1 L1,0 L0,0 Z',
    bottom: 'M0,0 L0,0.9 Q0.5,0.75 1,0.9 L1,0 L0,0 Z',
  },
  PeakValley: {
    top: 'M0,0 L0,0.9 Q0.125,1 0.25,1 Q0.375,1 0.5,0.9 Q0.625,0.8 0.75,0.8 Q0.875,0.8 1,0.9 L1,0 L0,0 Z',
    bottom:
      'M0,0 L0,0.9 Q0.125,1 0.25,1 Q0.375,1 0.5,0.9 Q0.625,0.8 0.75,0.8 Q0.875,0.8 1,0.9 L1,0 L0,0 Z',
  },
};

export type RibbonStyleTypes = keyof typeof ribbonPaths;
