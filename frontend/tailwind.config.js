/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundOpacity: {
        8: '0.08',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          alt: 'hsl(var(--primary-alt))',
          muted: 'hsl(var(--primary-muted))',
          soft: 'hsl(var(--primary-soft))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          pink: 'hsl(var(--secondary-pink) / <alpha-value>)',
          blue: 'hsl(var(--secondary-blue) / <alpha-value>)',
          green: 'hsl(var(--secondary-green) / <alpha-value>)',
          yellow: 'hsl(var(--secondary-yellow) / <alpha-value>)',
          purple: 'hsl(var(--secondary-purple) / <alpha-value>)',
        },
        tertiary: {
          blue: 'hsl(var(--tertiary-blue)  / <alpha-value>)',
          red: 'hsl(var(--tertiary-red)  / <alpha-value>)',
          yellow: 'hsl(var(--tertiary-yellow)  / <alpha-value>)',
          green: 'hsl(var(--tertiary-green)  / <alpha-value>)',
          purple: 'hsl(var(--tertiary-purple)  / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
        },
        text: {
          accent: 'hsl(var(--text-accent))',
          inverse: 'hsl(var(--text-inverse))',
        },
        gray: {
          100: 'hsl(var(--gray-100))',
          600: 'hsl(var(--gray-600))',
          900: 'hsl(var(--gray-900))',
        },

        black: 'hsl(var(--black))',

        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['Open Sans Variable', 'sans-serif'],
        montserrat: ['Montserrat Variable', 'sans-serif'],
        inter: ['Inter Variable', 'sans-serif'],
        nunito: ['Nunito Variable', 'sans-serif'],
      },
      keyframes: {
        'heart-pulse': {
          '0%': { fill: '##fb857c' },
          '50%': { fill: '#f45c57' },
          '100%': { fill: '##fb857c' },
        },
      },
      animation: {
        'heart-pulse': 'heart-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
