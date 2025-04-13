import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { registerFramework } from '@tanstack/cta-core'

export function register() {
  registerFramework({
    id: 'react-cra',
    name: 'react',
    description: 'Templates for React CRA',
    version: '0.1.0',
    baseDirectory: join(
      dirname(dirname(fileURLToPath(import.meta.url))),
      'project',
    ),
    addOnsDirectory: join(
      dirname(dirname(fileURLToPath(import.meta.url))),
      'add-ons',
    ),
    examplesDirectory: join(
      dirname(dirname(fileURLToPath(import.meta.url))),
      'examples',
    ),
  })
}
