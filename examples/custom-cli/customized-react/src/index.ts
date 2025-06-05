#!/usr/bin/env node
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { cli } from '@tanstack/cta-cli'
import { registerFramework, scanProjectDirectory } from '@tanstack/cta-engine'
import { createFrameworkDefinition } from '@tanstack/cta-framework-react-cra'

const frameworkDefinition = createFrameworkDefinition()

frameworkDefinition.id = 'react'
frameworkDefinition.name = 'react'
frameworkDefinition.description = 'Customized React Setup'
frameworkDefinition.version = '0.1.0'

const baseDirectory = dirname(dirname(fileURLToPath(import.meta.url)))
const { files } = scanProjectDirectory(
  join(baseDirectory, 'project'),
  join(baseDirectory, 'project/base'),
)

frameworkDefinition.base = {
  ...frameworkDefinition.base,
  ...files,
}

registerFramework(frameworkDefinition)

cli({
  name: 'customized-react-app',
  appName: 'React',
  defaultFramework: 'react',
})
