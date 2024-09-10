/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    minHeight: {
      8: '2rem',
      600: '600px',
      full: '100%',
    },
    extend: {
      cursor: {
        'r-resize': 'row-resize',
        'c-resize': 'col-resize',
        'grab': 'grab',
      },
      lineHeight: {
        16: '4rem',
        12: '3rem',
      },
      minWidth: {
        1256: '1256px',
      },
      spacing: {
        100: '25rem',
        24: '6rem',
        34: '8.5rem',
        22: '5.5rem',
      },
      colors: {
        dark: 'rgb(32, 32, 35)',
        darker: 'rgb(18, 18, 18)',
        light: '#F5F5F5',
        lighter: '#FAFAFA',
      },
    },
  },
}
