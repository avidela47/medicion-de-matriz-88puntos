/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0B1E24' },
        teal: {
          100: '#E4F2F0',
          300: '#8FCFC8',
          500: '#2F8F8A',
          600: '#226E68',
          700: '#1B5E5A',
          900: '#0F3336',
        },
        paper: '#F5F8F7',
        ink: '#12232A',
        muted: '#5C7175',
        line: '#DCE6E4',
        lineStrong: '#B9CBC8',
        amber: '#B8863A',
        good: '#2E7D5B',
        bad: '#B5473B',
      },
      fontFamily: {
        disp: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};