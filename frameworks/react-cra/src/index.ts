import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  registerFramework,
  scanAddOnDirectories,
  scanProjectDirectory,
} from '@tanstack/cta-engine'

import type { FrameworkDefinition } from '@tanstack/cta-engine'

export function createFrameworkDefinition(): FrameworkDefinition {
  const baseDirectory = dirname(dirname(fileURLToPath(import.meta.url)))

  const addOns = scanAddOnDirectories([
    join(baseDirectory, 'add-ons'),
    join(baseDirectory, 'toolchains'),
    join(baseDirectory, 'examples'),
    join(baseDirectory, 'hosts'),
  ])

  const { files, basePackageJSON, optionalPackages } = scanProjectDirectory(
    join(baseDirectory, 'project'),
    join(baseDirectory, 'project/base'),
  )

  return {
    id: 'react-cra',
    name: 'React',
    description: 'Templates for React CRA',
    version: '0.1.0',
    base: files,
    addOns,
    basePackageJSON,
    optionalPackages,
    supportedModes: {
      'code-router': {
        displayName: 'Code Router',
        description: 'TanStack Router using code to define routes',
        forceTypescript: false,
      },
      'file-router': {
        displayName: 'File Router',
        description: 'TanStack Router using files to define routes',
        forceTypescript: true,
      },
    },
  }
}

export function register() {
  registerFramework(createFrameworkDefinition())
}
