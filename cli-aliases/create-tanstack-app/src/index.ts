#!/usr/bin/env node
console.warn('\x1b[33m%s\x1b[0m', 'Warning: create-tanstack-app is deprecated. Use "tanstack create" or "npx @tanstack/cli create" instead.')
console.warn('\x1b[33m%s\x1b[0m', '         See: https://tanstack.com/start/latest/docs/framework/react/quick-start\n')

import { cli } from '@tanstack/cli'

cli({
  name: 'create-tanstack-app',
  appName: 'TanStack',
  forcedDeployment: 'nitro',
  legacyAutoCreate: true,
})
