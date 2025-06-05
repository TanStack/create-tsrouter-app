#!/usr/bin/env node
import { cli } from '@tanstack/cta-cli'

import { register as registerReactCra } from '@tanstack/cta-framework-react-cra'
import { register as registerSolid } from '@tanstack/cta-framework-solid'

registerReactCra()
registerSolid()

cli({
  name: 'create-tanstack',
  appName: 'TanStack',
  defaultTemplate: 'file-router',
  craCompatible: true,
})
