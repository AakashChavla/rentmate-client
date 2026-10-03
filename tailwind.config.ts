import type { Config } from 'tailwindcss';
export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: Object.fromEntries(
        [
          'background',
          'foreground',
          'card',
          'card-foreground',
          'border',
          'primary',
          'primary-foreground',
          'muted',
          'muted-foreground',
          'success',
          'warning',
          'danger',
        ].map((name) => [name, `hsl(var(--${name}) / <alpha-value>)`]),
      ),
      backgroundImage: { brand: 'var(--brand-gradient)' },
      borderRadius: { xl: 'var(--radius)' },
      boxShadow: {
        soft: '0 4px 24px rgb(15 23 42 / .04)',
        preview: '0 24px 80px -20px rgb(79 70 229 / .2)',
        brand: '0 8px 24px rgb(79 70 229 / .2)',
      },
    },
  },
  plugins: [],
} satisfies Config;
