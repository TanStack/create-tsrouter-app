import { intro } from '@clack/prompts'

import {
  finalizeAddOns,
  getFrameworkById,
  getPackageManager,
  populateAddOnOptionsDefaults,
  readConfigFile,
} from '@tanstack/cta-engine'

import {
  getProjectName,
  promptForAddOnOptions,
  selectAddOns,
  selectGit,
  selectHost,
  selectPackageManager,
  selectRouterType,
  selectTailwind,
  selectToolchain,
  selectTypescript,
} from './ui-prompts.js'

import type { Options } from '@tanstack/cta-engine'

import type { CliOptions } from './types.js'

export async function promptForCreateOptions(
  cliOptions: CliOptions,
  {
    forcedAddOns = [],
    forcedMode,
  }: {
    forcedAddOns?: Array<string>
    forcedMode?: string
  },
): Promise<Required<Options> | undefined> {
  const options = {} as Required<Options>

  options.framework = getFrameworkById(cliOptions.framework || 'react-cra')!

  options.projectName = cliOptions.projectName || (await getProjectName())

  // Router type selection
  if (forcedMode) {
    options.mode = forcedMode
  } else if (cliOptions.template) {
    options.mode =
      cliOptions.template === 'file-router' ? 'file-router' : 'code-router'
  } else {
    options.mode = await selectRouterType()
  }

  // TypeScript selection (if using Code Router)
  // TODO: Make this declarative
  options.typescript =
    options.mode === 'file-router' || options.framework.id === 'solid'
  if (
    forcedMode &&
    options.framework.supportedModes[forcedMode].forceTypescript
  ) {
    options.typescript = true
  }
  if (!options.typescript && options.mode === 'code-router') {
    options.typescript = await selectTypescript()
  }

  // Tailwind selection
  if (!cliOptions.tailwind && options.framework.id === 'react-cra') {
    options.tailwind = await selectTailwind()
  } else {
    options.tailwind = true
  }

  // Package manager selection
  if (cliOptions.packageManager) {
    options.packageManager = cliOptions.packageManager
  } else {
    const detectedPackageManager = await getPackageManager()
    options.packageManager =
      detectedPackageManager || (await selectPackageManager())
  }

  // Toolchain selection
  const toolchain = await selectToolchain(
    options.framework,
    cliOptions.toolchain,
  )

  // Host selection
  const host = await selectHost(options.framework, cliOptions.host)

  // Add-ons selection
  const addOns: Set<string> = new Set()

  if (toolchain) {
    addOns.add(toolchain)
  }
  if (host) {
    addOns.add(host)
  }

  for (const addOn of forcedAddOns) {
    addOns.add(addOn)
  }

  if (Array.isArray(cliOptions.addOns)) {
    for (const addOn of cliOptions.addOns) {
      addOns.add(addOn)
    }
  } else {
    for (const addOn of await selectAddOns(
      options.framework,
      options.mode,
      'add-on',
      'What add-ons would you like for your project?',
      forcedAddOns,
    )) {
      addOns.add(addOn)
    }

    for (const addOn of await selectAddOns(
      options.framework,
      options.mode,
      'example',
      'Would you like any examples?',
      forcedAddOns,
    )) {
      addOns.add(addOn)
    }
  }

  options.chosenAddOns = Array.from(
    await finalizeAddOns(options.framework, options.mode, Array.from(addOns)),
  )

  if (options.chosenAddOns.length) {
    options.tailwind = true
    options.typescript = true
  }

  // Prompt for add-on options in interactive mode
  if (Array.isArray(cliOptions.addOns)) {
    // Non-interactive mode: use defaults
    options.addOnOptions = populateAddOnOptionsDefaults(options.chosenAddOns)
  } else {
    // Interactive mode: prompt for options
    const userOptions = await promptForAddOnOptions(
      options.chosenAddOns.map((a) => a.id),
      options.framework,
    )
    const defaultOptions = populateAddOnOptionsDefaults(options.chosenAddOns)
    // Merge user options with defaults
    options.addOnOptions = { ...defaultOptions, ...userOptions }
  }
  options.git = cliOptions.git || (await selectGit())

  return options
}

export async function promptForAddOns(): Promise<Array<string>> {
  const config = await readConfigFile(process.cwd())

  if (!config) {
    console.error('No config file found')
    process.exit(1)
  }

  const framework = getFrameworkById(config.framework)

  if (!framework) {
    console.error(`Unknown framework: ${config.framework}`)
    process.exit(1)
  }

  intro(`Adding new add-ons to '${config.projectName}'`)

  const addOns: Set<string> = new Set()

  for (const addOn of await selectAddOns(
    framework,
    config.mode!,
    'add-on',
    'What add-ons would you like for your project?',
    config.chosenAddOns,
  )) {
    addOns.add(addOn)
  }

  for (const addOn of await selectAddOns(
    framework,
    config.mode!,
    'example',
    'Would you like any examples?',
    config.chosenAddOns,
  )) {
    addOns.add(addOn)
  }

  return Array.from(addOns)
}
