#!/usr/bin/env node
import { cli } from '@tanstack/cta-cli'

import { register as registerReactCra } from '@tanstack/cta-framework-react-cra'
import { register as registerSolid } from '@tanstack/cta-framework-solid'

registerReactCra()
registerSolid()

cli({
  name: 'create-tsrouter-app',
  appName: 'TanStack',
  forcedHost: 'nitro',
  craCompatible: true,
})
