#!/usr/bin/env node
import { cli } from '@tanstack/cta-cli'

import { register as registerReactCra } from '@tanstack/cta-templates-react-cra'
import { register as registerSolid } from '@tanstack/cta-templates-solid'

registerReactCra()
registerSolid()

cli({
  name: 'create-start-app',
  appName: 'TanStack Start',
  forcedMode: 'file-router',
  forcedAddOns: ['start'],
})
