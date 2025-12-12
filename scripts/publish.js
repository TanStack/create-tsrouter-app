// @ts-check

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publish } from '@tanstack/publish-config'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await publish({
  packages: [
    {
      name: '@tanstack/create-start',
      packageDir: './cli/ts-create-start',
    },
    {
      name: 'create-tsrouter-app',
      packageDir: './cli/create-tsrouter-app',
    },
    {
      name: 'create-start-app',
      packageDir: './cli/create-start-app',
    },
    {
      name: 'create-tanstack-app',
      packageDir: './cli/create-tanstack-app',
    },
    {
      name: 'create-tanstack',
      packageDir: './cli/create-tanstack',
    },
    {
      name: '@tanstack/cta-cli',
      packageDir: './packages/cta-cli',
    },
    {
      name: '@tanstack/cta-engine',
      packageDir: './packages/cta-engine',
    },
    {
      name: '@tanstack/cta-ui',
      packageDir: './packages/cta-ui',
    },
    {
      name: '@tanstack/cta-ui-base',
      packageDir: './packages/cta-ui-base',
    },
    {
      name: '@tanstack/cta-frameworks-react-cra',
      packageDir: './frameworks/react-cra',
    },
    {
      name: '@tanstack/cta-frameworks-solid',
      packageDir: './frameworks/solid',
    },
  ],
  branchConfigs: {
    main: {
      prerelease: false,
    },
    alpha: {
      prerelease: true,
    },
    beta: {
      prerelease: true,
    },
  },
  rootDir: resolve(__dirname, '..'),
  branch: process.env.BRANCH,
  tag: process.env.TAG,
  ghToken: process.env.GH_TOKEN,
})

process.exit(0)
