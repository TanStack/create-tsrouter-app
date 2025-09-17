import { resolve } from 'node:path'

import {
  createApp,
  createDefaultEnvironment,
  createMemoryEnvironment,
  finalizeAddOns,
  getFrameworkById,
  loadStarter,
  populateAddOnOptionsDefaults,
} from '@tanstack/cta-engine'

import { TMP_TARGET_DIR } from '../constants.js'

import { cleanUpFileArray, cleanUpFiles } from './file-helpers.js'
import { getApplicationMode, getProjectPath } from './server-environment.js'

import type {
  Environment,
  Options,
  SerializedOptions,
  Starter,
} from '@tanstack/cta-engine'

import type { Response } from 'express'

export async function createAppWrapper(
  projectOptions: SerializedOptions,
  opts: {
    dryRun?: boolean
    response?: Response
    environmentFactory?: () => Environment
  },
) {
  const framework = getFrameworkById(projectOptions.framework)!
  if (!framework) {
    throw new Error(`Framework ${projectOptions.framework} not found`)
  }

  let starter: Starter | undefined
  const addOns: Array<string> = [...projectOptions.chosenAddOns]
  if (projectOptions.starter) {
    starter = await loadStarter(projectOptions.starter)
    if (starter)
      for (const addOn of starter.dependsOn ?? []) {
        addOns.push(addOn)
      }
  }
  const chosenAddOns = await finalizeAddOns(
    framework,
    projectOptions.mode,
    addOns,
  )

  const projectPath = getProjectPath()
  const targetDir = opts.dryRun
    ? TMP_TARGET_DIR
    : getApplicationMode() === 'add'
      ? projectOptions.targetDir
      : resolve(projectPath, projectOptions.projectName)

  const options: Options = {
    ...projectOptions,
    targetDir,
    starter,
    framework,
    chosenAddOns,
    addOnOptions: (!projectOptions.addOnOptions || Object.keys(projectOptions.addOnOptions).length === 0) 
      ? populateAddOnOptionsDefaults(chosenAddOns) 
      : projectOptions.addOnOptions,
  }

  function createEnvironment() {
    if (opts.dryRun) {
      return createMemoryEnvironment(targetDir)
    }
    return {
      environment: opts.environmentFactory?.() ?? createDefaultEnvironment(),
      output: { files: {}, deletedFiles: [], commands: [] },
    }
  }

  const { environment, output } = createEnvironment()

  if (opts.response) {
    opts.response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    })

    environment.startStep = ({ id, type, message }) => {
      opts.response!.write(
        JSON.stringify({
          msgType: 'start',
          id,
          type,
          message,
        }) + '\n',
      )
    }
    environment.finishStep = (id, message) => {
      opts.response!.write(
        JSON.stringify({
          msgType: 'finish',
          id,
          message,
        }) + '\n',
      )
    }

    await createApp(environment, options)
    opts.response.end()
  } else {
    await createApp(environment, options)

    output.files = cleanUpFiles(output.files, targetDir)
    output.deletedFiles = cleanUpFileArray(output.deletedFiles, targetDir)

    return output
  }
}
