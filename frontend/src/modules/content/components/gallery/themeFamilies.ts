import type { ComponentType, SVGProps } from 'react';
import type { ThemeListItem } from '@icaf/shared';

export type ThemeFamilyCardModel = {
  kind: 'theme';
  description?: string;
  display_name: string;
  latest_start_date: number;
  theme_family: string;
  themes: ThemeListItem[];
};

export type VirtualThemeMenuItem = {
  kind: 'virtual-theme';
  id: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  ariaLabel?: string;
  description?: string;
  display_name?: string;
  href?: string;
  placement?: 'before-themes' | 'after-themes';
  title?: string;
  to?: string;
  width?: 'icon' | 'compact' | 'theme';
};

export type GalleryThemeMenuItem = ThemeFamilyCardModel | VirtualThemeMenuItem;

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
        kind: 'theme' as const,
        description: latestTheme.description,
        display_name: latestTheme.display_name,
        latest_start_date: themeStartDate(latestTheme),
        theme_family,
        themes: sortedThemes,
      };
    })
    .sort((a, b) => b.latest_start_date - a.latest_start_date);
}

export function buildThemeMenuItems(
  themes: ThemeListItem[],
  virtualItems: VirtualThemeMenuItem[] = [],
): GalleryThemeMenuItem[] {
  const themeFamilies = buildThemeFamilies(themes);
  const beforeThemes = virtualItems.filter(
    (item) => item.placement !== 'after-themes',
  );
  const afterThemes = virtualItems.filter(
    (item) => item.placement === 'after-themes',
  );

  return [...beforeThemes, ...themeFamilies, ...afterThemes];
}
