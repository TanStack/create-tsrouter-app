import { basename, resolve } from 'node:path'

import { isBase64 } from './file-helpers.js'
import { formatCommand } from './utils.js'
import { writeConfigFileToEnvironment } from './config-file.js'
import {
  getPackageManagerScriptCommand,
  packageManagerInstall,
} from './package-manager.js'
import { createPackageJSON } from './package-json.js'
import { createTemplateFile } from './template-file.js'
import { installShadcnComponents } from './integrations/shadcn.js'
import { setupGit } from './integrations/git.js'
import { runSpecialSteps } from './special-steps/index.js'

import type { Environment, FileBundleHandler, Options } from './types.js'

async function writeFiles(environment: Environment, options: Options) {
  const templateFileFromContent = createTemplateFile(environment, options)

  async function writeFileBundle(bundle: FileBundleHandler) {
    const files = await bundle.getFiles()
    for (const file of files) {
      const contents = await bundle.getFileContents(file)
      const isBinaryFile = isBase64(contents)
      if (isBinaryFile) {
        await environment.writeFileBase64(
          resolve(options.targetDir, file),
          contents,
        )
      } else {
        await templateFileFromContent(file, contents)
      }
    }

    const deletedFiles = await bundle.getDeletedFiles()
    for (const file of deletedFiles) {
      await environment.deleteFile(resolve(options.targetDir, file))
    }
  }

  environment.startStep({
    id: 'write-framework-files',
    type: 'file',
    message: 'Writing framework files...',
  })
  await writeFileBundle(options.framework)
  environment.finishStep('write-framework-files', 'Framework files written')

  let wroteAddonFiles = false
  for (const type of ['add-on', 'example', 'toolchain', 'deployment']) {
    for (const phase of ['setup', 'add-on', 'example']) {
      for (const addOn of options.chosenAddOns.filter(
        (addOn) => addOn.phase === phase && addOn.type === type,
      )) {
        environment.startStep({
          id: 'write-addon-files',
          type: 'file',
          message: `Writing ${addOn.name} files...`,
        })
        await writeFileBundle(addOn)
        wroteAddonFiles = true
      }
    }
  }
  if (wroteAddonFiles) {
    environment.finishStep('write-addon-files', 'Add-on files written')
  }

  if (options.starter) {
    environment.startStep({
      id: 'write-starter-files',
      type: 'file',
      message: 'Writing starter files...',
    })
    await writeFileBundle(options.starter)
    environment.finishStep('write-starter-files', 'Starter files written')
  }

  environment.startStep({
    id: 'write-package-json',
    type: 'file',
    message: 'Writing package.json...',
  })
  await environment.writeFile(
    resolve(options.targetDir, './package.json'),
    JSON.stringify(createPackageJSON(options), null, 2),
  )
  environment.finishStep('write-package-json', 'Package.json written')

  environment.startStep({
    id: 'write-config-file',
    type: 'file',
    message: 'Writing config file...',
  })
  await writeConfigFileToEnvironment(environment, options)
  environment.finishStep('write-config-file', 'Config file written')
}

async function runCommandsAndInstallDependencies(
  environment: Environment,
  options: Options,
) {
  const s = environment.spinner()

  // Setup git
  if (options.git) {
    s.start(`Initializing git repository...`)
    environment.startStep({
      id: 'initialize-git-repository',
      type: 'command',
      message: 'Initializing git repository...',
    })

    await setupGit(environment, options.targetDir)

    environment.finishStep(
      'initialize-git-repository',
      'Initialized git repository',
    )
    s.stop(`Initialized git repository`)
  }

  // Run any special steps for the new add-ons
  const specialSteps = new Set<string>([])
  for (const addOn of options.chosenAddOns) {
    for (const step of addOn.createSpecialSteps || []) {
      specialSteps.add(step)
    }
  }
  if (specialSteps.size) {
    await runSpecialSteps(environment, options, Array.from(specialSteps))
  }

  // Install dependencies
  s.start(`Installing dependencies via ${options.packageManager}...`)
  environment.startStep({
    id: 'install-dependencies',
    type: 'package-manager',
    message: `Installing dependencies via ${options.packageManager}...`,
  })
  await packageManagerInstall(
    environment,
    options.targetDir,
    options.packageManager,
  )
  environment.finishStep('install-dependencies', 'Installed dependencies')
  s.stop(`Installed dependencies`)

  // Run any post-init special steps for the new add-ons
  const postInitSpecialSteps = new Set<string>([])
  for (const addOn of options.chosenAddOns) {
    for (const step of addOn.postInitSpecialSteps || []) {
      postInitSpecialSteps.add(step)
    }
  }
  if (postInitSpecialSteps.size) {
    await runSpecialSteps(
      environment,
      options,
      Array.from(postInitSpecialSteps),
    )
  }

  for (const phase of ['setup', 'add-on', 'example']) {
    for (const addOn of options.chosenAddOns.filter(
      (addOn) =>
        addOn.phase === phase && addOn.command && addOn.command.command,
    )) {
      s.start(`Running commands for ${addOn.name}...`)
      const cmd = formatCommand({
        command: addOn.command!.command,
        args: addOn.command!.args || [],
      })
      environment.startStep({
        id: 'run-commands',
        type: 'command',
        message: cmd,
      })
      await environment.execute(
        addOn.command!.command,
        addOn.command!.args || [],
        options.targetDir,
        { inherit: true },
      )
      environment.finishStep('run-commands', 'Setup commands complete')
      s.stop(`${addOn.name} commands complete`)
    }
  }

  // Adding starter
  if (
    options.starter &&
    options.starter.command &&
    options.starter.command.command
  ) {
    s.start(`Setting up starter ${options.starter.name}...`)
    const cmd = formatCommand({
      command: options.starter.command.command,
      args: options.starter.command.args || [],
    })
    environment.startStep({
      id: 'run-starter-command',
      type: 'command',
      message: cmd,
    })

    await environment.execute(
      options.starter.command.command,
      options.starter.command.args || [],
      options.targetDir,
      { inherit: true },
    )

    environment.finishStep('run-starter-command', 'Starter command complete')
    s.stop(`${options.starter.name} commands complete`)
  }

  await installShadcnComponents(environment, options.targetDir, options)
}

function report(environment: Environment, options: Options) {
  const warnings: Array<string> = []
  for (const addOn of options.chosenAddOns) {
    if (addOn.warning) {
      warnings.push(addOn.warning)
    }
  }

  if (warnings.length > 0) {
    environment.warn('Warnings', warnings.join('\n'))
  }

  // Format errors
  let errorStatement = ''
  if (environment.getErrors().length) {
    errorStatement = `

Errors were encountered during the creation of your app:

${environment.getErrors().join('\n')}`
  }

  // Check if we created in current directory (user specified ".")
  const isCurrentDirectory =
    resolve(options.targetDir) === resolve(process.cwd())
  const locationMessage = isCurrentDirectory
    ? `Your ${environment.appName} app is ready.`
    : `Your ${environment.appName} app is ready in '${basename(options.targetDir)}'.`
  const cdInstruction = isCurrentDirectory
    ? ''
    : `% cd ${options.projectName}
`

  // Use the force luke! :)
  environment.outro(
    `${locationMessage}

Use the following commands to start your app:
${cdInstruction}% ${formatCommand(
      getPackageManagerScriptCommand(options.packageManager, ['dev']),
    )}

Please check the README.md for information on testing, styling, adding routes, etc.${errorStatement}`,
  )
}

export async function createApp(environment: Environment, options: Options) {
  environment.startRun()
  await writeFiles(environment, options)
  await runCommandsAndInstallDependencies(environment, options)
  environment.finishRun()

  report(environment, options)
}
