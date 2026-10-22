import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // https://vitest.dev/config/
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    // Most tests take well under 1 s; the IT-01 journey about 2 s. Under heavy load
    // (six suites at once) IT-01 reached 15 s, and 5 s caused false failures. A generous
    // limit only delays the report of a test that is really stuck.
    testTimeout: 30_000,
    // Tests always use the mock, even when .env.local selects Supabase for `npm run dev`
    // (Vite loads .env.local in every mode, test included). No test talks to a real project (D-30).
    env: { VITE_DATA_SOURCE: 'mock' },
  },
})
