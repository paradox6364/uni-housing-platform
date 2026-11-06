/** @type {import('tailwindcss').Config} */

// تحويل متغير CSS إلى لون يفهمه Tailwind (يدعم الشفافية مثل bg-slate-900/80)
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

const brand = {
  50: '#f0f4f8',
  100: '#d9e2ec',
  200: '#bcccdc',
  300: '#9fb3c8',
  400: '#627d98',
  500: '#334e68',
  600: '#142B4A',
  700: '#0f2138',
  800: '#0a1626',
  900: '#050b14',
  950: '#03070c'
};

// الرمادي: قيمه في globals.css وتتبدل تلقائيًا بين الوضع النهاري والليلي
const slate = Object.fromEntries(
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [n, withAlpha(`--slate-${n}`)])
);

module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Alexandria', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      colors: {
        brand,
        blue: brand,
        slate
      },
      borderRadius: {
        lg: '10px',
        xl: '10px',
        '2xl': '16px',
        '3xl': '16px',
      },
      boxShadow: {
        sm: '0 2px 10px -2px rgba(23, 32, 51, 0.05)',
        DEFAULT: '0 4px 16px -3px rgba(23, 32, 51, 0.06)',
        md: '0 8px 24px -4px rgba(23, 32, 51, 0.08)',
        lg: '0 12px 32px -6px rgba(23, 32, 51, 0.10)',
        xl: '0 20px 40px -8px rgba(23, 32, 51, 0.12)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      }
    }
  },
  plugins: []
};
