/** @type {import('tailwindcss').Config} */

// تحويل متغير CSS إلى لون يفهمه Tailwind (يدعم الشفافية مثل bg-slate-900/80)
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

// لون الموقع الأساسي (نيلي عصري). غيّر الأرقام هنا فيتغير لون الموقع كله
const brand = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b'
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
        sans: ['Cairo', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Tahoma', 'sans-serif']
      },
      colors: {
        brand,
        // أي مكان في الموقع مكتوب فيه blue ياخد لون الموقع الجديد تلقائيًا
        blue: brand,
        slate
      }
    }
  },
  plugins: []
};
