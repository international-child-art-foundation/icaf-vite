## Adding a Custom Theme Visual

1. Create a visual component in `visuals/`.
2. Import it in `registry.ts`.
3. Add an entry to `customThemeVisuals` with the theme aliases used by the API.

Set `decorated: true` when the visual needs white text and the dark readability
overlay. Leave it off for visuals that work with dark text.
