import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // GitHub Pages serves the game from https://ragib-nehal.github.io/eco-journey/
  base: '/eco-journey/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    passWithNoTests: true,
  },
})
