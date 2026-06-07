import { customThemeVisuals } from './registry';
import type { ThemeVisualDefinition, ThemeVisualProps } from './types';
import { DefaultThemeVisual } from './visuals/DefaultThemeVisual';

export function normalizeThemeVisualFamily(family: string) {
  return family.trim().toUpperCase();
}

function findThemeVisual(family: string): ThemeVisualDefinition | undefined {
  const normalizedFamily = normalizeThemeVisualFamily(family);
  return customThemeVisuals.find((definition) =>
    definition.aliases
      .map(normalizeThemeVisualFamily)
      .includes(normalizedFamily),
  );
}

export function hasDecoratedThemeVisual(family: string) {
  return findThemeVisual(family)?.decorated === true;
}

export function GalleryThemeVisual({
  family,
  isActive = false,
}: ThemeVisualProps) {
  const definition = findThemeVisual(family);
  if (!definition) return <DefaultThemeVisual />;
  const Visual = definition.Visual;
  return <Visual family={family} isActive={isActive} />;
}
