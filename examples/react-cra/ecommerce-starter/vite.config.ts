import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Follow TanStack docs: tsconfigPaths, tanstackStart (with custom react plugin), router, react, tailwind
    tsconfigPaths(),
    tanstackStart({ customViteReactPlugin: true }),
    tanstackRouter(),
    react(),
    tailwindcss(),
  ],
})
