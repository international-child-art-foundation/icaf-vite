/**
 * Shared CSS breakpoints (in px) used across the app for responsive logic
 * and media query strings. Keep in sync with tailwind.config if you add custom values.
 *
 * Usage in <Picture>:  media={`(max-width: ${breakpoints.mobile}px)`}
 * Usage in JS logic:   if (width <= breakpoints.mobile) { ... }
 */
export const breakpoints = {
  mobile: 500,
} as const;
