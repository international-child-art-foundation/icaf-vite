## Adding a Custom Theme Visual

1. Create a visual component in `visuals/`.
2. Export a `*_VISUAL_DURATION_SECONDS` value from the visual component file
   when the default `7.2` seconds is not right for that theme.
3. Import the visual and duration in `registry.ts`.
4. Add an entry to `customThemeVisuals` with the theme aliases used by the API.

Set `decorated: true` when the visual needs white text and the dark readability
overlay. Leave it off for visuals that work with dark text.

Visuals should render within the wrapper's absolute bounds. Keep shared theme
dimensions in `constants.ts` instead of hardcoding width or height in individual
visual files.

Set `theme_debug: true` in `frontend/src/shared/debugFlags.ts` to show the
theme progress readout while designing visuals. The deployment workflows run
`scripts/ensureDebugFlagsDisabled.mjs` and fail when any debug flag is enabled.
