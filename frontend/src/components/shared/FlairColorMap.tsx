export const FlairColorMap = {
  red: {
    borderHover: 'hover:border-secondary-pink',
    border: 'border-secondary-pink',
    background: 'bg-secondary-pink',
    icon: 'text-secondary-pink',
  },
  yellow: {
    borderHover: 'hover:border-secondary-yellow',
    border: 'border-secondary-yellow',
    background: 'bg-secondary-yellow',
    icon: 'text-secondary-yellow',
  },
  tertiaryYellow: {
    borderHover: 'hover:border-tertiary-yellow',
    border: 'border-tertiary-yellow',
    background: 'bg-tertiary-yellow',
    icon: 'text-tertiary-yellow',
  },
  purple: {
    borderHover: 'hover:border-secondary-purple',
    border: 'border-secondary-purple',
    background: 'bg-secondary-purple',
    icon: 'text-secondary-purple',
  },
  blue: {
    borderHover: 'hover:border-secondary-blue',
    border: 'border-secondary-blue',
    background: 'bg-secondary-blue',
    icon: 'text-secondary-blue',
  },
  tertiaryBlue: {
    borderHover: 'hover:border-tertiary-blue',
    border: 'border-tertiary-blue',
    background: 'bg-tertiary-blue',
    icon: 'text-tertiary-blue',
  },
  green: {
    borderHover: 'hover:border-secondary-green',
    border: 'border-secondary-green',
    background: 'bg-secondary-green',
    icon: 'text-secondary-green',
  },
} as const;
export type ColorKey = keyof typeof FlairColorMap;
