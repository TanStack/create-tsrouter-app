import { rimrafNodeModules } from './rimraf-node-modules.js'
import { postInitScript } from './post-init-script.js'

import type { Environment, Options } from '../types.js'

const specialStepsLookup: Record<
  string,
  (environment: Environment, options: Options) => Promise<void>
> = {
  'rimraf-node-modules': rimrafNodeModules,
  'post-init-script': postInitScript,
}

export async function runSpecialSteps(
  environment: Environment,
  options: Options,
  specialSteps: Array<string>,
) {
  if (specialSteps.length) {
    environment.startStep({
      id: 'special-steps',
      type: 'command',
      message: 'Running special steps...',
    })

    for (const step of specialSteps) {
      const stepFunction = specialStepsLookup[step]
      /* eslint-disable @typescript-eslint/no-unnecessary-condition */
      if (stepFunction) {
        await stepFunction(environment, options)
      } else {
        environment.error(`Special step ${step} not found`)
      }
    }

    environment.finishStep('special-steps', 'Special steps complete')
  }
}
