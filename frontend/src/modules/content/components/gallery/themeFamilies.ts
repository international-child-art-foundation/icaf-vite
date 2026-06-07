import type { ThemeListItem } from '@icaf/shared';

export type ThemeFamilyCardModel = {
  description?: string;
  display_name: string;
  latest_start_date: number;
  theme_family: string;
  themes: ThemeListItem[];
};

export function themeStartDate(theme: ThemeListItem): number {
  const value = (theme as { start_date?: unknown }).start_date;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function buildThemeFamilies(
  themes: ThemeListItem[],
): ThemeFamilyCardModel[] {
  const familyMap = new Map<string, ThemeListItem[]>();
  for (const theme of themes) {
    const themesForFamily = familyMap.get(theme.theme_family) ?? [];
    themesForFamily.push(theme);
    familyMap.set(theme.theme_family, themesForFamily);
  }

  return [...familyMap.entries()]
    .map(([theme_family, familyThemes]) => {
      const sortedThemes = [...familyThemes].sort(
        (a, b) => themeStartDate(b) - themeStartDate(a),
      );
      const latestTheme = sortedThemes[0];
      return {
        description: latestTheme.description,
        display_name: latestTheme.display_name,
        latest_start_date: themeStartDate(latestTheme),
        theme_family,
        themes: sortedThemes,
      };
    })
    .sort((a, b) => b.latest_start_date - a.latest_start_date);
}
