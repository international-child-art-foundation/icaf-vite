export const FlairColorMap = {
  red: {
    borderHover: 'hover:border-secondary-pink',
    border: 'border-secondary-pink',
    background: 'bg-secondary-pink',
    backgroundHover: 'hover:bg-secondary-pink/10',
    icon: 'text-secondary-pink',
  },
  yellow: {
    borderHover: 'hover:border-secondary-yellow',
    border: 'border-secondary-yellow',
    background: 'bg-secondary-yellow',
    backgroundHover: 'hover:bg-secondary-yellow/10',
    icon: 'text-secondary-yellow',
  },
  tertiaryYellow: {
    borderHover: 'hover:border-tertiary-yellow',
    border: 'border-tertiary-yellow',
    background: 'bg-tertiary-yellow',
    backgroundHover: 'hover:bg-tertiary-yellow/10',
    icon: 'text-tertiary-yellow',
  },
  purple: {
    borderHover: 'hover:border-secondary-purple',
    border: 'border-secondary-purple',
    background: 'bg-secondary-purple',
    backgroundHover: 'hover:bg-secondary-purple/10',
    icon: 'text-secondary-purple',
  },
  blue: {
    borderHover: 'hover:border-secondary-blue',
    border: 'border-secondary-blue',
    background: 'bg-secondary-blue',
    backgroundHover: 'hover:bg-secondary-blue/10',
    icon: 'text-secondary-blue',
  },
  green: {
    borderHover: 'hover:border-secondary-green',
    border: 'border-secondary-green',
    background: 'bg-secondary-green',
    backgroundHover: 'hover:bg-secondary-green/10',
    icon: 'text-secondary-green',
  },
  black: {
    borderHover: 'hover:border-black',
    border: 'border-black',
    background: 'bg-black',
    backgroundHover: 'hover:bg-black/10',
    icon: 'text-black',
  },
  tertiaryBlue: {
    borderHover: 'hover:border-tertiary-blue',
    border: 'border-tertiary-blue',
    background: 'bg-tertiary-blue',
    backgroundHover: 'hover:bg-tertiary-blue/10',
    icon: 'text-tertiary-blue',
  },
  tertiaryPurple: {
    borderHover: 'hover:border-tertiary-purple',
    border: 'border-tertiary-purple',
    background: 'bg-tertiary-purple',
    backgroundHover: 'hover:bg-tertiary-purple/10',
    icon: 'text-tertiary-purple',
  },
  primaryBlue: {
    borderHover: 'hover:border-primary',
    border: 'border-primary',
    background: 'bg-primary',
    backgroundHover: 'hover:bg-primary/10',
    icon: 'text-primary',
  },
} as const;

export type ColorKey = keyof typeof FlairColorMap;
