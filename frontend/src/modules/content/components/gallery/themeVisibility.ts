import { parseThemeSK, type ThemeListItem } from '@icaf/shared';

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
  const featuredFamilies = new Set(
    themes
      .filter((theme) => {
        const parsed = parseThemeSK(theme.theme_sk);
        return parsed?.kind === 'family' && isThemeFeaturedOn(theme, surface);
      })
      .map((theme) => theme.theme_family),
  );

  return themes.filter((theme) => {
    const parsed = parseThemeSK(theme.theme_sk);
    return (
      isThemeFeaturedOn(theme, surface) ||
      (parsed?.kind === 'instance' && featuredFamilies.has(parsed.theme_family))
    );
  });
}
