/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ['./src/**/*.{html,ts}'],
  theme: {
    fontFamily: { sans: ['var(--bodyfont)'] },
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        warn: 'var(--warn)',
        success: 'var(--success)',
        bodytext: 'var(--bodytext)',
        bodycolor: 'var(--bodycolor)',
        gray: 'var(--gray)',
        link: 'var(--link)',
        inactif: 'var(--inactif)',
      },
    },
  },
  plugins: [require('prettier-plugin-tailwindcss')],
};
