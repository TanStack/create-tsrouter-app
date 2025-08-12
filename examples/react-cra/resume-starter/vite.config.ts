import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import contentCollections from '@content-collections/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin should come before react
    tanstackRouter(),
    react(),
    tsconfigPaths(),
    contentCollections(),
    tailwindcss(),
  ],
})
