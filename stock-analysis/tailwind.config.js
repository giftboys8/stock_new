/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // 日间模式颜色（水墨淡彩）
        'ink-black': '#1a1a1a',
        'ink-gray': '#4a4a4a',
        'ink-light': '#7a7a7a',
        'paper': '#f5f2eb',
        'paper-light': '#faf8f3',
        'bamboo': '#2d5a3d',
        'bamboo-light': '#4a7c5f',
        'ochre': '#8b7355',
        'seal-red': '#8b3a3a',
        'indigo': '#4a6fa5',
        'border-ink': '#d4d0c8',

        // 夜间模式颜色（月夜山水）
        'night-mountain': '#1a2a2a',
        'night-sky': '#0d1620',
        'night-deep': '#081018',
        'moonlight': '#e8e4dc',
        'night-bamboo': '#3d6a4d',
        'night-fog': '#2a3a3a',
      },
      fontFamily: {
        'title': ['"Ma Shan Zheng"', '"STKaiti"', '"KaiTi"', 'cursive'],
        'body': ['"Noto Serif SC"', '"STSong"', '"SimSun"', 'serif'],
        'data': ['"Noto Sans SC"', '"STHeiti"', '"SimHei"', 'sans-serif'],
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.5rem',
      },
      boxShadow: {
        'ink': '0 2px 8px rgba(45, 90, 61, 0.1)',
        'ink-lg': '0 4px 16px rgba(45, 90, 61, 0.15)',
      },
    },
  },
  plugins: [],
}
