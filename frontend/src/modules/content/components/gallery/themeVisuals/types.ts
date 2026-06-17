export type ThemeVisualProps = {
  family: string;
  isActive?: boolean;
  durationSeconds?: number;
};

export type ThemeVisualPalette = {
  primary: string;
  secondary?: string;
};

export type ThemeVisualStaticElement = {
  kind: 'shape';
  className: string;
};

export type ThemeVisualDefinition = {
  aliases: string[];
  decorated?: boolean;
  durationSeconds?: number;
  videoSrc?: string;
  mirrored?: boolean;
  palette?: ThemeVisualPalette;
  staticElements?: ThemeVisualStaticElement[];
};
