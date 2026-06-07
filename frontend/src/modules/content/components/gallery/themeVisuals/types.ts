import type { ComponentType } from 'react';

export type ThemeVisualProps = {
  family: string;
  isActive?: boolean;
};

export type ThemeVisualDefinition = {
  aliases: string[];
  decorated?: boolean;
  Visual: ComponentType<ThemeVisualProps>;
};
