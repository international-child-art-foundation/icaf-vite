## Adding a Custom Theme Visual

1. Add the theme's optional `.mp4` to `frontend/src/shared/lib/largeMedia.ts`
   when it lives on the large-media remote.
2. Add an entry to `customThemeVisuals` in `registry.ts` with the theme aliases
   used by the API.
3. Set `videoSrc` for themes that have an animated background. Leave it off to
   use the static fallback.
4. Set `durationSeconds` when the default `7.2` seconds is not right for that
   theme's debug readout.

Set `decorated: true` when the visual needs white text and the dark readability
overlay. Leave it off for visuals that work with dark text.

Theme videos play once when active and hold on their final frame. Desktop
activation is hover-based. Mobile activation is selection-based.

Use `palette.primary` and `palette.secondary` for theme ribbon colors.
`staticElements` is reserved for small unanimated accents that should stay
secondary to the video.

Keep shared theme dimensions in `constants.ts` instead of hardcoding width or
height in individual visual files.

Set `theme_debug: true` in `frontend/src/shared/debugFlags.ts` to show the
theme progress readout while designing visuals. The deployment workflows run
`scripts/ensureDebugFlagsDisabled.mjs` and fail when any debug flag is enabled.
