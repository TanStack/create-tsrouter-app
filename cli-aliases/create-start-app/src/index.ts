#!/usr/bin/env node
console.warn('\x1b[33m%s\x1b[0m', 'Warning: create-start-app is deprecated. Use "tanstack create" or "npx @tanstack/cli create" instead.')
console.warn('\x1b[33m%s\x1b[0m', '         See: https://tanstack.com/start/latest/docs/framework/react/quick-start\n')

import { cli } from '@tanstack/cli'
import {
  createReactFrameworkDefinition,
  createSolidFrameworkDefinition,
} from '@tanstack/create'

cli({
  name: 'create-start-app',
  appName: 'TanStack Start',
  forcedMode: 'file-router',
  forcedAddOns: ['start'],
  showDeploymentOptions: true,
  forcedDeployment: 'nitro',
  craCompatible: true,
  legacyAutoCreate: true,
  frameworkDefinitionInitializers: [
    createReactFrameworkDefinition,
    createSolidFrameworkDefinition,
  ],
})
