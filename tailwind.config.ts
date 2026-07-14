import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        elevated: 'var(--elevated)',
        border: 'var(--border)',
        'border-soft': 'var(--border-soft)',
        primary: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        faint: 'var(--text-faint)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        restaurant: 'var(--restaurant)',
        'restaurant-soft': 'var(--restaurant-soft)',
        apartments: 'var(--apartments)',
        'apartments-soft': 'var(--apartments-soft)',
        recruitment: 'var(--recruitment)',
        'recruitment-soft': 'var(--recruitment-soft)',
        logistics: 'var(--logistics)',
        'logistics-soft': 'var(--logistics-soft)',
        office: 'var(--office)',
        'office-soft': 'var(--office-soft)',
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
    },
  },
  plugins: [],
};

export default config;
