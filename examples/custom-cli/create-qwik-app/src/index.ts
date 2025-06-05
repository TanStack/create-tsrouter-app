#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  registerFramework,
  scanAddOnDirectories,
  scanProjectDirectory,
} from '@tanstack/cta-engine'
import { cli } from '@tanstack/cta-cli'

const projectDirectory = join(
  dirname(dirname(fileURLToPath(import.meta.url))),
  'project',
)

const addOns = scanAddOnDirectories([
  join(dirname(dirname(fileURLToPath(import.meta.url))), 'add-ons'),
])

const { files, basePackageJSON, optionalPackages } = scanProjectDirectory(
  projectDirectory,
  join(dirname(dirname(fileURLToPath(import.meta.url))), 'project'),
)

registerFramework({
  id: 'qwik',
  name: 'qwik',
  description: 'Templates for Qwik',
  version: '0.1.0',
  base: files,
  addOns,
  basePackageJSON,
  optionalPackages,
  supportedModes: {
    default: {
      displayName: 'Default',
      description: 'Default Qwik template',
      forceTypescript: true,
    },
  },
})

cli({
  name: 'create-qwik-app',
  appName: 'Qwik',
  defaultFramework: 'qwik',
  webBase: join(
    dirname(dirname(fileURLToPath(import.meta.url))),
    'customized-ui/dist',
  ),
})
