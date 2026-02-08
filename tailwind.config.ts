import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pc-blue': '#000080',
        'pc-light-blue': '#0000AA',
        'pc-gray': '#C0C0C0',
        'pc-dark-gray': '#808080',
        'crt-green': '#33ff33',
        'crt-amber': '#ffb000',
        'crt-cyan': '#00ffff',
      },
      fontFamily: {
        'retro': ['var(--font-vt323)', 'Courier New', 'monospace'],
        'pixel': ['var(--font-vt323)', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
