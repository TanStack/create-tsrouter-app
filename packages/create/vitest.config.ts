import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setupVitest.js'],
    deps: {
      moduleDirectories: ['node_modules', path.resolve('../../packages')],
    },
    coverage: {
      exclude: [
        'node_modules',
        'dist',
        'build',
        'tests/**',
        '**/types.ts',
        'vitest.config.ts',
      ],
    },
  },
})
