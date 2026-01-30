#!/usr/bin/env node
console.warn('\x1b[33m%s\x1b[0m', 'Warning: create-tsrouter-app is deprecated. Use "tanstack create --router-only" or "npx @tanstack/cli create --router-only" instead.')
console.warn('\x1b[33m%s\x1b[0m', '         See: https://tanstack.com/router/latest/docs/framework/react/quick-start\n')

import { cli } from '@tanstack/cli'

cli({
  name: 'create-tsrouter-app',
  appName: 'TanStack',
  craCompatible: true,
  legacyAutoCreate: true,
})
