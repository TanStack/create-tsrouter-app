import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')

describe('copy-assets', () => {
  it('should copy .ts asset files to dist', () => {
    // Regression test: .ts files in assets directories must be copied
    // See: https://github.com/TanStack/cli/issues/XXX
    const tsAssetFiles = [
      'frameworks/react/add-ons/t3env/assets/src/env.ts',
      'frameworks/react/add-ons/tRPC/assets/src/integrations/trpc/init.ts',
      'frameworks/solid/add-ons/convex/assets/convex/schema.ts',
    ]

    for (const file of tsAssetFiles) {
      const fullPath = resolve(distDir, file)
      expect(existsSync(fullPath), `Expected ${file} to exist in dist`).toBe(
        true,
      )
    }
  })

  it('should copy .tsx asset files to dist', () => {
    const tsxAssetFiles = [
      'frameworks/react/add-ons/tRPC/assets/src/routes/demo/trpc-todo.tsx',
      'frameworks/solid/add-ons/convex/assets/src/routes/demo/convex.tsx',
    ]

    for (const file of tsxAssetFiles) {
      const fullPath = resolve(distDir, file)
      expect(existsSync(fullPath), `Expected ${file} to exist in dist`).toBe(
        true,
      )
    }
  })

  it('should copy .d.ts files to dist', () => {
    const dtsFiles = [
      'frameworks/react/add-ons/convex/assets/convex/_generated/api.d.ts',
    ]

    for (const file of dtsFiles) {
      const fullPath = resolve(distDir, file)
      expect(existsSync(fullPath), `Expected ${file} to exist in dist`).toBe(
        true,
      )
    }
  })
})
