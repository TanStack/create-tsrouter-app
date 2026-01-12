import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { getPackageManagerScriptCommand } from '../package-manager.js'

import type { Environment, Options } from '../types.js'

export async function postInitScript(
  environment: Environment,
  options: Options,
) {
  const packageJsonPath = resolve(options.targetDir, 'package.json')

  if (!environment.exists(packageJsonPath)) {
    environment.warn(
      'Warning',
      'No package.json found, skipping post-cta-init script',
    )
    return
  }

  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)

    if (!packageJson.scripts || !packageJson.scripts['post-cta-init']) {
      // No post-cta-init script found, skip silently
      return
    }

    environment.startStep({
      id: 'post-init-script',
      type: 'command',
      message: 'Running post-cta-init script...',
    })

    const { command, args } = getPackageManagerScriptCommand(
      options.packageManager,
      ['post-cta-init'],
    )

    await environment.execute(command, args, options.targetDir, {
      inherit: true,
    })

    environment.finishStep('post-init-script', 'Post-cta-init script complete')
  } catch (error) {
    environment.error(
      `Failed to run post-cta-init script: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
