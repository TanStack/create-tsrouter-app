#!/usr/bin/env node
console.warn('\x1b[33m%s\x1b[0m', 'Warning: @tanstack/create-start is deprecated. Use "tanstack create" or "npx @tanstack/cli create" instead.')
console.warn('\x1b[33m%s\x1b[0m', '         See: https://tanstack.com/start/latest/docs/framework/react/quick-start\n')

import { cli } from '@tanstack/cli'

cli({
  name: '@tanstack/create-start',
  forcedDeployment: 'nitro',
  appName: 'TanStack Start',
  forcedMode: 'file-router',
  forcedAddOns: ['start'],
  craCompatible: true,
  showDeploymentOptions: true,
  legacyAutoCreate: true,
})
