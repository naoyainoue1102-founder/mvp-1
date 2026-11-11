/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Polymarket-inspired institutional palette
        canvas: '#EDF1F7',      // page background — muted blue-gray
        surface: '#FFFFFF',     // card surface
        line: '#E2E8F0',        // hairline border
        lineSoft: '#EEF2F7',    // softer divider
        ink: {
          50: '#F4F7FB',        // lightest tint — debug bars
          100: '#E8EDF5',
          200: '#D1D9E5',
          300: '#B0BCCD',       // faded text / avatars
          400: '#8A98A8',       // tertiary / labels
          500: '#5B6B7E',       // secondary body
          600: '#3E4A5C',       // muted body
          700: '#1F2A37',       // primary body
          800: '#132033',       // strong emphasis
          900: '#0B1727',       // near-black headings
        },
        odds: {
          up: '#2E9C6A',        // match-rate positive (muted green)
          flat: '#3B4252',      // neutral odds
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
