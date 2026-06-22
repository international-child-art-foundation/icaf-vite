export const debugFlags = {
  theme_debug: false,
} as const;

export const any_debug = Object.values(debugFlags).some(Boolean);
