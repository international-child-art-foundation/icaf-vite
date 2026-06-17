import { useEffect, useRef } from 'react';
import { debugFlags } from '@/shared/debugFlags';
import { DEFAULT_THEME_VISUAL_DURATION_SECONDS } from './constants';
import { customThemeVisuals } from './registry';
import { ThemeVisualDebug } from './ThemeVisualDebug';
import type {
  ThemeVisualDefinition,
  ThemeVisualPalette,
  ThemeVisualProps,
} from './types';
import { DefaultThemeVisual } from './visuals/DefaultThemeVisual';

const defaultThemePalette: ThemeVisualPalette = {
  primary: '#FEC342',
};

const fallbackThemePalettes: ThemeVisualPalette[] = [
  defaultThemePalette,
  { primary: '#0286C3' },
  { primary: '#F45C57' },
  { primary: '#4C9F38' },
  { primary: '#7C3AED' },
  { primary: '#F97316' },
];

export function normalizeThemeVisualFamily(family: string) {
  return family.trim().toUpperCase();
}

export function findThemeVisual(
  family: string,
): ThemeVisualDefinition | undefined {
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

function hashThemeFamily(family: string): number {
  return normalizeThemeVisualFamily(family)
    .split('')
    .reduce((hash, character) => hash + character.charCodeAt(0), 0);
}

export function getThemeVisualPalette(family: string): ThemeVisualPalette {
  const palette = findThemeVisual(family)?.palette;
  if (palette) return palette;

  const fallbackIndex = hashThemeFamily(family) % fallbackThemePalettes.length;
  return fallbackThemePalettes[fallbackIndex] ?? defaultThemePalette;
}

export function GalleryThemeVisual({
  family,
  isActive = false,
}: ThemeVisualProps) {
  const definition = findThemeVisual(family);
  const durationSeconds =
    definition?.durationSeconds ?? DEFAULT_THEME_VISUAL_DURATION_SECONDS;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <DefaultThemeVisual />
      {definition?.videoSrc && (
        <ThemeVideoVisual
          isActive={isActive}
          src={definition.videoSrc}
          mirrored={definition.mirrored === true}
        />
      )}
      {debugFlags.theme_debug && (
        <ThemeVisualDebug
          durationSeconds={durationSeconds}
          isActive={isActive}
        />
      )}
    </div>
  );
}

type ThemeVideoVisualProps = {
  isActive: boolean;
  src: string;
  mirrored?: boolean;
};

function ThemeVideoVisual({
  isActive,
  src,
  mirrored = false,
}: ThemeVideoVisualProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isActive) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    video.currentTime = 0;
    const playPromise = video.play();
    playPromise?.catch(() => {
      video.pause();
    });
  }, [isActive, src]);

  return (
    <div className="h-full w-full border-2">
      <video
        ref={videoRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-cover ${
          mirrored ? '-scale-x-100' : ''
        }`}
        muted
        playsInline
        preload="metadata"
        src={src}
      />
    </div>
  );
}
