import type { ThemeListItem } from '@icaf/shared';

export const THEME_SURFACES = {
  gallery: 'gallery',
  submitArtwork: 'submit-artwork',
} as const;

type ThemeSurface = (typeof THEME_SURFACES)[keyof typeof THEME_SURFACES];

export function isThemeFeaturedOn(
  theme: ThemeListItem,
  surface: ThemeSurface,
) {
  return theme.featured_on.includes(surface);
}

export function filterThemesForSurface(
  themes: ThemeListItem[],
  surface: ThemeSurface,
) {
  return themes.filter((theme) => isThemeFeaturedOn(theme, surface));
}
