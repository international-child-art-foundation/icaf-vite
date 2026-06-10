import { debugFlags } from '@/shared/debugFlags';
import { DEFAULT_THEME_VISUAL_DURATION_SECONDS } from './constants';
import { customThemeVisuals } from './registry';
import { ThemeVisualDebug } from './ThemeVisualDebug';
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
  const Visual = definition?.Visual ?? DefaultThemeVisual;
  const durationSeconds =
    definition?.durationSeconds ?? DEFAULT_THEME_VISUAL_DURATION_SECONDS;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Visual
        family={family}
        isActive={isActive}
        durationSeconds={durationSeconds}
      />
      {debugFlags.theme_debug && (
        <ThemeVisualDebug
          durationSeconds={durationSeconds}
          isActive={isActive}
        />
      )}
    </div>
  );
}
