import { basename, resolve } from 'node:path'

import { CONFIG_FILE } from './constants.js'
import { finalizeAddOns } from './add-ons.js'
import { getFrameworkById } from './frameworks.js'
import { createMemoryEnvironment } from './environment.js'
import { createApp } from './create-app.js'
import {
  readConfigFileFromEnvironment,
  writeConfigFileToEnvironment,
} from './config-file.js'
import { formatCommand } from './utils.js'
import { packageManagerInstall } from './package-manager.js'
import {
  isBase64,
  recursivelyGatherFilesFromEnvironment,
} from './file-helpers.js'
import { mergePackageJSON } from './package-json.js'
import { runSpecialSteps } from './special-steps/index.js'
import { loadStarter } from './custom-add-ons/starter.js'

import type { Environment, Options } from './types.js'
import type { PersistedOptions } from './config-file.js'

export async function hasPendingGitChanges(
  environment: Environment,
  cwd: string,
) {
  const { stdout } = await environment.execute(
    'git',
    ['status', '--porcelain'],
    cwd,
  )
  return stdout.length > 0
}

async function createOptions(
  json: PersistedOptions,
  addOns: Array<string>,
  targetDir: string,
): Promise<Options> {
  const framework = getFrameworkById(json.framework)

  const starter = json.starter ? await loadStarter(json.starter) : undefined

  return {
    ...json,
    framework,
    tailwind: true,
    addOns: true,
    chosenAddOns: await finalizeAddOns(framework!, json.mode!, [
      ...json.chosenAddOns,
      ...addOns,
    ]),
    targetDir,
    starter,
  } as Options
}

async function runCreateApp(options: Required<Options>) {
  const { environment, output } = createMemoryEnvironment(options.targetDir)
  await createApp(environment, options)
  return output
}

export async function getCurrentConfiguration(
  environment: Environment,
  cwd: string,
) {
  const persistedOptions = await readConfigFileFromEnvironment(environment, cwd)
  if (!persistedOptions) {
    environment.error(
      'There is no .cta.json file in your project.',
      'This is probably because this was created with an older version of create-tsrouter-app.',
    )
    return undefined
  }

  return persistedOptions
}

export async function writeFiles(
  environment: Environment,
  cwd: string,
  output: {
    files: Record<string, string>
    deletedFiles: Array<string>
  },
  forced: boolean,
) {
  const currentFiles = await recursivelyGatherFilesFromEnvironment(
    environment,
    cwd,
    false,
  )

  const overwrittenFiles: Array<string> = []
  const changedFiles: Array<string> = []
  for (const file of Object.keys(output.files)) {
    const relativeFile = file.replace(cwd, '')
    if (currentFiles[relativeFile]) {
      if (currentFiles[relativeFile] !== output.files[file]) {
        overwrittenFiles.push(relativeFile)
      }
    } else {
      changedFiles.push(relativeFile)
    }
  }

  if (!forced && overwrittenFiles.length) {
    environment.warn(
      'The following will be overwritten',
      [...overwrittenFiles, ...output.deletedFiles].join('\n'),
    )
    const shouldContinue = await environment.confirm('Do you want to continue?')
    if (!shouldContinue) {
      throw new Error('User cancelled')
    }
  }

  for (const file of output.deletedFiles) {
    if (environment.exists(resolve(cwd, file))) {
      await environment.deleteFile(resolve(cwd, file))
    }
  }

  environment.startStep({
    id: 'write-files',
    type: 'file',
    message: 'Writing add-on files...',
  })

  for (const file of [...changedFiles, ...overwrittenFiles]) {
    const fName = basename(file)
    const contents = output.files[file]
    if (fName === 'package.json') {
      const currentJson = JSON.parse(
        await environment.readFile(resolve(cwd, file)),
      )
      const newJSON = mergePackageJSON(currentJson, JSON.parse(contents))
      environment.writeFile(
        resolve(cwd, file),
        JSON.stringify(newJSON, null, 2),
      )
    } else if (fName !== CONFIG_FILE) {
      if (isBase64(contents)) {
        await environment.writeFileBase64(resolve(cwd, file), contents)
      } else {
        await environment.writeFile(resolve(cwd, file), contents)
      }
    }
  }

  environment.finishStep('write-files', 'Add-on files written')
}

export async function runNewCommands(
  environment: Environment,
  originalOptions: PersistedOptions,
  cwd: string,
  output: {
    commands: Array<{
      command: string
      args: Array<string>
    }>
  },
) {
  const originalOutput = await runCreateApp({
    ...(await createOptions(originalOptions, [], cwd)),
  } as Required<Options>)

  const originalCommands = new Set(
    originalOutput.commands.map((c) => [c.command, ...c.args].join(' ')),
  )

  for (const command of output.commands) {
    const commandString = [command.command, ...command.args].join(' ')
    if (!originalCommands.has(commandString)) {
      environment.startStep({
        id: 'run-commands',
        type: 'command',
        message: `Running ${formatCommand({ command: command.command, args: command.args })}...`,
      })
      await environment.execute(command.command, command.args, cwd)
      environment.finishStep('run-commands', 'Setup commands complete')
    }
  }
}

export async function addToApp(
  environment: Environment,
  addOns: Array<string>,
  cwd: string,
  options?: {
    forced?: boolean
  },
) {
  const persistedOptions = await getCurrentConfiguration(environment, cwd)
  if (!persistedOptions) {
    return
  }

  if (!options?.forced && (await hasPendingGitChanges(environment, cwd))) {
    environment.error(
      'You have pending git changes.',
      'Please commit or stash them before adding add-ons.',
    )
    return
  }

  environment.intro(`Adding ${addOns.join(', ')} to the project...`)
  environment.startStep({
    id: 'processing-new-app-setup',
    type: 'file',
    message: 'Processing new app setup...',
  })

  const newOptions = await createOptions(persistedOptions, addOns, cwd)

  const output = await runCreateApp({
    ...newOptions,
    targetDir: cwd,
  } as Required<Options>)

  await writeFiles(environment, cwd, output, !!options?.forced)

  environment.finishStep(
    'processing-new-app-setup',
    'Application files written',
  )

  // Run any special steps for the new add-ons

  const specialSteps = new Set<string>([])
  for (const addOn of newOptions.chosenAddOns) {
    for (const step of addOn.addOnSpecialSteps || []) {
      if (addOns.includes(addOn.id)) {
        specialSteps.add(step)
      }
    }
  }
  if (specialSteps.size) {
    await runSpecialSteps(environment, newOptions, Array.from(specialSteps))
  }

  // Install dependencies

  environment.startStep({
    id: 'install-dependencies',
    type: 'package-manager',
    message: `Installing dependencies via ${newOptions.packageManager}...`,
  })
  const s = environment.spinner()
  s.start(`Installing dependencies via ${newOptions.packageManager}...`)
  await packageManagerInstall(
    environment,
    newOptions.targetDir,
    newOptions.packageManager,
  )
  s.stop(`Installed dependencies`)
  environment.finishStep('install-dependencies', 'Dependencies installed')

  // Handle new commands

  await runNewCommands(environment, persistedOptions, cwd, output)

  environment.startStep({
    id: 'write-config-file',
    type: 'file',
    message: 'Writing config file...',
  })
  writeConfigFileToEnvironment(environment, newOptions)
  environment.finishStep('write-config-file', 'Config file written')

  environment.outro(`Add-ons ${addOns.join(', ')} added!`)
}
