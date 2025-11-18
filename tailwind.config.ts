import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7F5AF0',
          foreground: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 24px rgba(127, 90, 240, 0.15)'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
