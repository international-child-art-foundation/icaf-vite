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
  green: {
    borderHover: 'hover:border-secondary-green',
    border: 'border-secondary-green',
    background: 'bg-secondary-green',
    icon: 'text-secondary-green',
  },
} as const;
export type ColorKey = keyof typeof FlairColorMap;
