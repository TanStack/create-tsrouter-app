import { resolve } from 'node:path'
import { Command, InvalidArgumentError } from 'commander'
import { intro, log } from '@clack/prompts'
import chalk from 'chalk'

import {
  SUPPORTED_PACKAGE_MANAGERS,
  addToApp,
  compileAddOn,
  compileStarter,
  createApp,
  createSerializedOptions,
  getAllAddOns,
  getFrameworkById,
  getFrameworkByName,
  getFrameworks,
  initAddOn,
  initStarter,
} from '@tanstack/cta-engine'

import { launchUI } from '@tanstack/cta-ui'

import { runMCPServer } from './mcp.js'

import { promptForAddOns, promptForCreateOptions } from './options.js'
import { normalizeOptions } from './command-line.js'

import { createUIEnvironment } from './ui-environment.js'
import { convertTemplateToMode } from './utils.js'

import type { CliOptions, TemplateOptions } from './types.js'
import type { Options, PackageManager } from '@tanstack/cta-engine'

// This CLI assumes that all of the registered frameworks have the same set of toolchains, modes, etc.

export function cli({
  name,
  appName,
  forcedMode,
  forcedAddOns = [],
  defaultTemplate = 'javascript',
  defaultFramework,
  craCompatible = false,
  webBase,
}: {
  name: string
  appName: string
  forcedMode?: string
  forcedAddOns?: Array<string>
  defaultTemplate?: TemplateOptions
  defaultFramework?: string
  craCompatible?: boolean
  webBase?: string
}) {
  const environment = createUIEnvironment(appName, false)

  const program = new Command()

  const availableFrameworks = getFrameworks().map((f) => f.name)

  const toolchains = new Set<string>()
  for (const framework of getFrameworks()) {
    for (const addOn of framework.getAddOns()) {
      if (addOn.type === 'toolchain') {
        toolchains.add(addOn.id)
      }
    }
  }

  let defaultMode: string | undefined = forcedMode
  const supportedModes = new Set<string>()
  for (const framework of getFrameworks()) {
    for (const mode of Object.keys(framework.supportedModes)) {
      supportedModes.add(mode)
    }
  }
  if (defaultMode && !supportedModes.has(defaultMode)) {
    throw new InvalidArgumentError(
      `Invalid mode: ${defaultMode}. The following are allowed: ${Array.from(
        supportedModes,
      ).join(', ')}`,
    )
  }
  if (supportedModes.size < 2) {
    defaultMode = Array.from(supportedModes)[0]
  }

  program.name(name).description(`CLI to create a new ${appName} application`)

  program
    .command('add')
    .argument(
      '[add-on...]',
      'Name of the add-ons (or add-ons separated by spaces or commas)',
    )
    .option('--forced', 'Force the add-on to be added', false)
    .option('--ui', 'Add with the UI')
    .action(async (addOns: Array<string>) => {
      const parsedAddOns: Array<string> = []
      for (const addOn of addOns) {
        if (addOn.includes(',') || addOn.includes(' ')) {
          parsedAddOns.push(
            ...addOn.split(/[\s,]+/).map((addon) => addon.trim()),
          )
        } else {
          parsedAddOns.push(addOn.trim())
        }
      }
      if (program.opts().ui) {
        launchUI({
          mode: 'add',
          addOns: parsedAddOns,
          projectPath: resolve(process.cwd()),
          forcedRouterMode: defaultMode,
          forcedAddOns,
          environmentFactory: () => createUIEnvironment(appName, false),
          webBase,
        })
      } else if (parsedAddOns.length < 1) {
        const addOns = await promptForAddOns()
        if (addOns.length) {
          await addToApp(environment, addOns, resolve(process.cwd()), {
            forced: program.opts().forced,
          })
        }
      } else {
        await addToApp(environment, parsedAddOns, resolve(process.cwd()), {
          forced: program.opts().forced,
        })
      }
    })

  const addOnCommand = program.command('add-on')
  addOnCommand
    .command('init')
    .description('Initialize an add-on from the current project')
    .action(async () => {
      await initAddOn(environment)
    })
  addOnCommand
    .command('compile')
    .description('Update add-on from the current project')
    .action(async () => {
      await compileAddOn(environment)
    })

  const starterCommand = program.command('starter')
  starterCommand
    .command('init')
    .description('Initialize a project starter from the current project')
    .action(async () => {
      await initStarter(environment)
    })
  starterCommand
    .command('compile')
    .description('Compile the starter JSON file for the current project')
    .action(async () => {
      await compileStarter(environment)
    })

  program.argument('[project-name]', 'name of the project')

  if (!defaultMode && craCompatible) {
    program.option<'typescript' | 'javascript' | 'file-router'>(
      '--template <type>',
      'project template (typescript, javascript, file-router)',
      (value) => {
        if (
          value !== 'typescript' &&
          value !== 'javascript' &&
          value !== 'file-router'
        ) {
          throw new InvalidArgumentError(
            `Invalid template: ${value}. Only the following are allowed: typescript, javascript, file-router`,
          )
        }
        return value
      },
    )
  }

  if (!defaultFramework) {
    program.option<string>(
      '--framework <type>',
      `project framework (${availableFrameworks.join(', ')})`,
      (value) => {
        if (!availableFrameworks.includes(value)) {
          throw new InvalidArgumentError(
            `Invalid framework: ${value}. Only the following are allowed: ${availableFrameworks.join(', ')}`,
          )
        }
        return value
      },
      defaultFramework || 'react',
    )
  }

  program
    .option(
      '--starter [url]',
      'initialize this project from a starter URL',
      false,
    )
    .option<PackageManager>(
      `--package-manager <${SUPPORTED_PACKAGE_MANAGERS.join('|')}>`,
      `Explicitly tell the CLI to use this package manager`,
      (value) => {
        if (!SUPPORTED_PACKAGE_MANAGERS.includes(value as PackageManager)) {
          throw new InvalidArgumentError(
            `Invalid package manager: ${value}. The following are allowed: ${SUPPORTED_PACKAGE_MANAGERS.join(
              ', ',
            )}`,
          )
        }
        return value as PackageManager
      },
    )

  if (toolchains.size > 0) {
    program.option<string>(
      `--toolchain <${Array.from(toolchains).join('|')}>`,
      `Explicitly tell the CLI to use this toolchain`,
      (value) => {
        if (!toolchains.has(value)) {
          throw new InvalidArgumentError(
            `Invalid toolchain: ${value}. The following are allowed: ${Array.from(
              toolchains,
            ).join(', ')}`,
          )
        }
        return value
      },
    )
  }

  program
    .option('--interactive', 'interactive mode', false)
    .option('--tailwind', 'add Tailwind CSS', false)
    .option<Array<string> | boolean>(
      '--add-ons [...add-ons]',
      'pick from a list of available add-ons (comma separated list)',
      (value: string) => {
        let addOns: Array<string> | boolean = !!value
        if (typeof value === 'string') {
          addOns = value.split(',').map((addon) => addon.trim())
        }
        return addOns
      },
    )
    .option('--list-add-ons', 'list all available add-ons', false)
    .option('--no-git', 'do not create a git repository')
    .option(
      '--target-dir <path>',
      'the target directory for the application root',
    )
    .option('--mcp', 'run the MCP server', false)
    .option('--mcp-sse', 'run the MCP server in SSE mode', false)
    .option('--ui', 'Add with the UI')

  program.action(async (projectName: string, options: CliOptions) => {
    if (options.listAddOns) {
      const addOns = await getAllAddOns(
        getFrameworkById(options.framework || defaultFramework || 'react-cra')!,
        defaultMode ||
          convertTemplateToMode(options.template || defaultTemplate),
      )
      for (const addOn of addOns.filter((a) => !forcedAddOns.includes(a.id))) {
        console.log(`${chalk.bold(addOn.id)}: ${addOn.description}`)
      }
    } else if (options.mcp || options.mcpSse) {
      await runMCPServer(!!options.mcpSse, {
        forcedMode: defaultMode,
        forcedAddOns,
        appName,
      })
    } else {
      try {
        const cliOptions = {
          projectName,
          ...options,
        } as CliOptions

        cliOptions.framework = getFrameworkByName(
          options.framework || defaultFramework || 'react',
        )!.id

        if (defaultMode) {
          cliOptions.template = defaultMode as TemplateOptions
        }

        let finalOptions: Options | undefined
        if (cliOptions.interactive) {
          cliOptions.addOns = true
        } else {
          finalOptions = await normalizeOptions(
            cliOptions,
            defaultMode,
            forcedAddOns,
          )
        }

        if (options.ui) {
          const optionsFromCLI = await normalizeOptions(
            cliOptions,
            defaultMode,
            forcedAddOns,
            { disableNameCheck: true },
          )
          launchUI({
            mode: 'setup',
            options: {
              ...createSerializedOptions(optionsFromCLI!),
              projectName: 'my-app',
              targetDir: resolve(process.cwd(), 'my-app'),
            },
            forcedRouterMode: defaultMode,
            forcedAddOns,
            environmentFactory: () => createUIEnvironment(appName, false),
            webBase,
          })
          return
        }

        if (finalOptions) {
          intro(`Creating a new ${appName} app in ${projectName}...`)
        } else {
          intro(`Let's configure your ${appName} application`)
          finalOptions = await promptForCreateOptions(cliOptions, {
            forcedMode: defaultMode,
            forcedAddOns,
          })
        }

        if (!finalOptions) {
          throw new Error('No options were provided')
        }

        finalOptions.targetDir =
          options.targetDir || resolve(process.cwd(), finalOptions.projectName)

        await createApp(environment, finalOptions)
      } catch (error) {
        log.error(
          error instanceof Error ? error.message : 'An unknown error occurred',
        )
        process.exit(1)
      }
    }
  })

  program.parse()
}
