/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      daisyui: {
        themes: [{

        }]
      }
    },
  },
  plugins: [
      require('daisyui'),
      require('@tailwindcss/forms')
  ],
}
