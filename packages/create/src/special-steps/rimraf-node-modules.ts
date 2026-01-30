import { resolve } from 'node:path'

import type { Environment, Options } from '../types.js'

const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']

export async function rimrafNodeModules(
  environment: Environment,
  options: Options,
) {
  environment.startStep({
    id: 'special-steps',
    type: 'command',
    message: 'Removing node_modules...',
  })

  await environment.rimraf(resolve(options.targetDir, 'node_modules'))

  for (const lockFile of lockFiles) {
    const lockFilePath = resolve(options.targetDir, lockFile)
    if (environment.exists(lockFilePath)) {
      await environment.deleteFile(lockFilePath)
    }
  }
}
