export const ribbonPaths = {
  Ellipse: {
    top: 'M0,0 L0,0.1 Q0.5,0.25 1,0.1 L1,0 L0,0 Z',
    bottom: 'M0,0 L0,0.9 Q0.5,0.75 1,0.9 L1,0 L0,0 Z',
  },
  PeakValley: {
    top: 'M0,0.05 Q0.125,0.00 0.25,0.00 Q0.375,0.00 0.50,0.05 Q0.625,0.10 0.75,0.10 Q0.875,0.10 1,0.05 L1,1 L0,1 Z',
    bottom:
      'M0,0 L1,0 L1,0.95 Q0.875,1.00 0.75,1.00 Q0.625,1.00 0.50,0.95 Q0.375,0.90 0.25,0.90 Q0.125,0.90 0,0.95 Z',
  },
};

export type RibbonStyleTypes = keyof typeof ribbonPaths;
