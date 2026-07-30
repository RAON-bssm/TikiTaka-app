const { palette } = require('./src/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/features/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    'text-2xl',
    'text-xl',
    'text-lg',
    'text-md',
    'text-sm',
    'text-xs',
    'font-bold',
    'font-sans',
    'font-regular',
    'text-primary-800',
    'text-primary-500',
    'text-primary-600',
    'text-gray-400',
    'text-gray-700',
    'text-gray-500',
    'text-secondary-500',
  ],
  presets: [require('nativewind/preset')],
  corePlugins: { borderOpacity: true },
  theme: {
    extend: {
      // 색상은 src/constants/colors.js 를 단일 소스로 공유한다 (앱 코드와 동일한 팔레트).
      colors: {
        gray: palette.gray,
        primary: palette.primary,
        secondary: palette.secondary,
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '40px',
        '4xl': '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Pretendard-Medium'],
        regular: ['Pretendard-Regular'],
        medium: ['Pretendard-Medium'],
        bold: ['Pretendard-Bold'],
        title: ['OkDanDan-Bold'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '14px' }],
        sm: ['14px', { lineHeight: '16px' }],
        md: ['16px', { lineHeight: '19px' }],
        lg: ['18px', { lineHeight: '21px' }],
        xl: ['20px', { lineHeight: '24px' }],
        '2xl': ['24px', { lineHeight: '28px' }],
        '3xl': ['32px', { lineHeight: '36px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
      },
    },
  },
  plugins: [],
};
