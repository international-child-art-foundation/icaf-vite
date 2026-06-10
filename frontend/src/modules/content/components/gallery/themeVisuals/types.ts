import type { ComponentType } from 'react';

export type ThemeVisualProps = {
  family: string;
  isActive?: boolean;
  durationSeconds?: number;
};

export type ThemeVisualDefinition = {
  aliases: string[];
  decorated?: boolean;
  durationSeconds?: number;
  Visual: ComponentType<ThemeVisualProps>;
};
