#!/usr/bin/env node
import { cli } from '@tanstack/cta-cli'

import {
  createFrameworkDefinition as createReactCraFrameworkDefinitionInitalizer,
  register as registerReactCra,
} from '@tanstack/cta-framework-react-cra'
import {
  createFrameworkDefinition as createSolidFrameworkDefinitionInitalizer,
  register as registerSolid,
} from '@tanstack/cta-framework-solid'

registerReactCra()
registerSolid()

cli({
  name: 'create-start-app',
  appName: 'TanStack Start',
  forcedMode: 'file-router',
  forcedAddOns: ['start'],
  craCompatible: true,
  frameworkDefinitionInitializers: [
    createReactCraFrameworkDefinitionInitalizer,
    createSolidFrameworkDefinitionInitalizer,
  ],
})
