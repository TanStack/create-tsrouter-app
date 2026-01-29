import { resolve } from 'node:path'

import type { Environment } from '../types.js'

export async function setupGit(environment: Environment, targetDir: string) {
  await environment.execute('git', ['init'], resolve(targetDir))
}
