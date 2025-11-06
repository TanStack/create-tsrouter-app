import fs from 'node:fs'
import { resolve } from 'node:path'
import { Command, InvalidArgumentError } from 'commander'
import { intro, log } from '@clack/prompts'
import chalk from 'chalk'
import semver from 'semver'

import {
  SUPPORTED_PACKAGE_MANAGERS,
  addToApp,
  compileAddOn,
  compileStarter,
  createApp,
  createSerializedOptions,
  getAllAddOns,
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

// This CLI assumes that all of the registered frameworks have the same set of toolchains, hosts, modes, etc.

export function cli({
  name,
  appName,
  forcedMode,
  forcedAddOns = [],
  defaultTemplate = 'javascript',
  forcedHost,
  defaultFramework,
  craCompatible = false,
  webBase,
  showHostingOptions = false,
}: {
  name: string
  appName: string
  forcedMode?: string
  forcedAddOns?: Array<string>
  forcedHost?: string
  defaultTemplate?: TemplateOptions
  defaultFramework?: string
  craCompatible?: boolean
  webBase?: string
  showHostingOptions?: boolean
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

  const hosts = new Set<string>()
  for (const framework of getFrameworks()) {
    for (const addOn of framework.getAddOns()) {
      if (addOn.type === 'host') {
        hosts.add(addOn.id)
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
    .command('pin-versions')
    .description('Pin versions of the TanStack libraries')
    .action(async () => {
      if (!fs.existsSync('package.json')) {
        console.error('package.json not found')
        return
      }
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

      const packages: Record<string, string> = {
        '@tanstack/react-router': '',
        '@tanstack/router-generator': '',
        '@tanstack/react-router-devtools': '',
        '@tanstack/react-start': '',
        '@tanstack/react-start-config': '',
        '@tanstack/router-plugin': '',
        '@tanstack/react-start-client': '',
        '@tanstack/react-start-plugin': '1.115.0',
        '@tanstack/react-start-server': '',
        '@tanstack/start-server-core': '1.115.0',
      }

      function sortObject(obj: Record<string, string>): Record<string, string> {
        return Object.keys(obj)
          .sort()
          .reduce<Record<string, string>>((acc, key) => {
            acc[key] = obj[key]
            return acc
          }, {})
      }

      if (!packageJson.dependencies['@tanstack/react-start']) {
        console.error('@tanstack/react-start not found in dependencies')
        return
      }
      let changed = 0
      const startVersion = packageJson.dependencies[
        '@tanstack/react-start'
      ].replace(/^\^/, '')
      for (const pkg of Object.keys(packages)) {
        if (!packageJson.dependencies[pkg]) {
          packageJson.dependencies[pkg] = packages[pkg].length
            ? semver.maxSatisfying(
                [startVersion, packages[pkg]],
                `^${packages[pkg]}`,
              )!
            : startVersion
          changed++
        } else {
          if (packageJson.dependencies[pkg].startsWith('^')) {
            packageJson.dependencies[pkg] = packageJson.dependencies[
              pkg
            ].replace(/^\^/, '')
            changed++
          }
        }
      }
      packageJson.dependencies = sortObject(packageJson.dependencies)
      if (changed > 0) {
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
        console.log(
          `${changed} packages updated.

Remove your node_modules directory and package lock file and re-install.`,
        )
      } else {
        console.log(
          'No changes needed. The relevant TanStack packages are already pinned.',
        )
      }
    })

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
          showHostingOptions,
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
        if (
          !availableFrameworks.some(
            (f) => f.toLowerCase() === value.toLowerCase(),
          )
        ) {
          throw new InvalidArgumentError(
            `Invalid framework: ${value}. Only the following are allowed: ${availableFrameworks.join(', ')}`,
          )
        }
        return value
      },
      defaultFramework || 'React',
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

  if (hosts.size > 0) {
    program.option<string>(
      `--host <${Array.from(hosts).join('|')}>`,
      `Explicitly tell the CLI to use this hosting provider`,
      (value) => {
        if (!hosts.has(value)) {
          throw new InvalidArgumentError(
            `Invalid host: ${value}. The following are allowed: ${Array.from(
              hosts,
            ).join(', ')}`,
          )
        }
        return value
      },
    )
  }

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
    .option(
      '--addon-details <addon-id>',
      'show detailed information about a specific add-on',
    )
    .option('--no-git', 'do not create a git repository')
    .option(
      '--target-dir <path>',
      'the target directory for the application root',
    )
    .option('--mcp', 'run the MCP server', false)
    .option('--mcp-sse', 'run the MCP server in SSE mode', false)
    .option('--ui', 'Add with the UI')
    .option(
      '--add-on-config <config>',
      'JSON string with add-on configuration options',
    )
    .option(
      '-f, --force',
      'force project creation even if the target directory is not empty',
      false,
    )

  program.action(async (projectName: string, options: CliOptions) => {
    if (options.listAddOns) {
      const addOns = await getAllAddOns(
        getFrameworkByName(options.framework || defaultFramework || 'React')!,
        defaultMode ||
          convertTemplateToMode(options.template || defaultTemplate),
      )
      let hasConfigurableAddOns = false
      for (const addOn of addOns.filter((a) => !forcedAddOns.includes(a.id))) {
        const hasOptions =
          addOn.options && Object.keys(addOn.options).length > 0
        const optionMarker = hasOptions ? '*' : ' '
        if (hasOptions) hasConfigurableAddOns = true
        console.log(
          `${optionMarker} ${chalk.bold(addOn.id)}: ${addOn.description}`,
        )
      }
      if (hasConfigurableAddOns) {
        console.log('\n* = has configuration options')
      }
    } else if (options.addonDetails) {
      const addOns = await getAllAddOns(
        getFrameworkByName(options.framework || defaultFramework || 'React')!,
        defaultMode ||
          convertTemplateToMode(options.template || defaultTemplate),
      )
      const addOn = addOns.find((a) => a.id === options.addonDetails)
      if (!addOn) {
        console.error(`Add-on '${options.addonDetails}' not found`)
        process.exit(1)
      }

      console.log(
        `${chalk.bold.cyan('Add-on Details:')} ${chalk.bold(addOn.name)}`,
      )
      console.log(`${chalk.bold('ID:')} ${addOn.id}`)
      console.log(`${chalk.bold('Description:')} ${addOn.description}`)
      console.log(`${chalk.bold('Type:')} ${addOn.type}`)
      console.log(`${chalk.bold('Phase:')} ${addOn.phase}`)
      console.log(`${chalk.bold('Supported Modes:')} ${addOn.modes.join(', ')}`)

      if (addOn.link) {
        console.log(`${chalk.bold('Link:')} ${chalk.blue(addOn.link)}`)
      }

      if (addOn.dependsOn && addOn.dependsOn.length > 0) {
        console.log(
          `${chalk.bold('Dependencies:')} ${addOn.dependsOn.join(', ')}`,
        )
      }

      if (addOn.options && Object.keys(addOn.options).length > 0) {
        console.log(`\n${chalk.bold.yellow('Configuration Options:')}`)
        for (const [optionName, option] of Object.entries(addOn.options)) {
          if (option && typeof option === 'object' && 'type' in option) {
            const opt = option as any
            console.log(`  ${chalk.bold(optionName)}:`)
            console.log(`    Label: ${opt.label}`)
            if (opt.description) {
              console.log(`    Description: ${opt.description}`)
            }
            console.log(`    Type: ${opt.type}`)
            console.log(`    Default: ${opt.default}`)
            if (opt.type === 'select' && opt.options) {
              console.log(`    Available values:`)
              for (const choice of opt.options) {
                console.log(`      - ${choice.value}: ${choice.label}`)
              }
            }
          }
        }
      } else {
        console.log(`\n${chalk.gray('No configuration options available')}`)
      }

      if (addOn.routes && addOn.routes.length > 0) {
        console.log(`\n${chalk.bold.green('Routes:')}`)
        for (const route of addOn.routes) {
          console.log(`  ${chalk.bold(route.url)} (${route.name})`)
          console.log(`    File: ${route.path}`)
        }
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
          options.framework || defaultFramework || 'React',
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
            { forcedHost },
          )
        }

        if (options.ui) {
          const optionsFromCLI = await normalizeOptions(
            cliOptions,
            defaultMode,
            forcedAddOns,
            { disableNameCheck: true, forcedHost },
          )
          const options = {
            ...createSerializedOptions(optionsFromCLI!),
            projectName: 'my-app',
            targetDir: resolve(process.cwd(), 'my-app'),
          }
          launchUI({
            mode: 'setup',
            options,
            forcedRouterMode: defaultMode,
            forcedAddOns,
            environmentFactory: () => createUIEnvironment(appName, false),
            webBase,
            showHostingOptions,
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
            showHostingOptions,
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
