import type { ThemeColors, ThemeListItem } from '@icaf/shared';

function themeCardBackground(theme: ThemeListItem): string {
  const color = theme.colors?.primary ?? theme.colors?.background ?? '#0286C3';
  const secondary = theme.colors?.secondary ?? '#202020';
  const imageUrl = theme.card_image_url ?? theme.image_url;
  const image = imageUrl ? `url("${imageUrl}")` : '';
  return image
    ? `linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.42)), ${image}`
    : `linear-gradient(135deg, ${color}, ${secondary})`;
}

function themeTextColor(colors: ThemeColors | undefined): string {
  return colors?.text ?? '#ffffff';
}

type GalleryThemeCardProps = {
  active: boolean;
  onSelect: () => void;
  theme: ThemeListItem;
};

export function GalleryThemeCard({
  active,
  onSelect,
  theme,
}: GalleryThemeCardProps) {
  const accent = theme.colors?.accent ?? theme.colors?.secondary ?? '#ffffff';
  const textColor = themeTextColor(theme.colors);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative h-[80px] w-[230px] flex-none overflow-hidden p-3 text-left shadow-sm transition duration-200 sm:w-[250px] ${
        active
          ? 'ring-4 ring-black/20'
          : 'hover:-translate-y-0.5 hover:shadow-md'
      }`}
      style={{
        backgroundImage: themeCardBackground(theme),
        backgroundColor: theme.colors?.primary ?? theme.colors?.background,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        color: textColor,
      }}
    >
      <span className="bg-black/10 transition group-hover:bg-black/0" />
      <span
        className="bottom-0 h-1 opacity-90 transition"
        style={{ backgroundColor: accent }}
      />
      <span className="relative z-10 flex h-full flex-col justify-between">
        <span className="font-montserrat block text-lg font-bold">
          {theme.display_name}
        </span>
        {theme.description && (
          <span className="overflow-hidden text-xs opacity-90">
            {theme.description}
          </span>
        )}
      </span>
    </button>
  );
}
