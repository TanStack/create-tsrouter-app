import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwind()],
  server: {
    open: true,
    port: 3000,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
