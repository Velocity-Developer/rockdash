import typography from '@tailwindcss/typography'

export default {
  darkMode: 'class',

  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.{vue,js,ts}',
    './app.vue'
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'theme(colors.teal.500)',
          50: 'theme(colors.teal.50)',
          100: 'theme(colors.teal.100)',
          200: 'theme(colors.teal.200)',
          300: 'theme(colors.teal.300)',
          400: 'theme(colors.teal.400)',
          500: 'theme(colors.teal.500)',
          600: 'theme(colors.teal.600)',
          700: 'theme(colors.teal.700)',
          800: 'theme(colors.teal.800)',
          900: 'theme(colors.teal.900)',
        },
        secondary: {
          DEFAULT: 'theme(colors.orange.400)',
          50: 'theme(colors.orange.50)',
          100: 'theme(colors.orange.100)',
          200: 'theme(colors.orange.200)',
          300: 'theme(colors.orange.300)',
          400: 'theme(colors.orange.400)',
          500: 'theme(colors.orange.500)',
          600: 'theme(colors.orange.600)',
          700: 'theme(colors.orange.700)',
          800: 'theme(colors.orange.800)',
          900: 'theme(colors.orange.900)',
        },
      },
    },
  },

  plugins: [typography],
}
