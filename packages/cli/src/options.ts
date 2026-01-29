import fs from 'node:fs'
import { cancel, confirm, intro, isCancel } from '@clack/prompts'

import {
  finalizeAddOns,
  getFrameworkById,
  getPackageManager,
  populateAddOnOptionsDefaults,
  readConfigFile,
} from '@tanstack/create'

import {
  getProjectName,
  promptForAddOnOptions,
  selectAddOns,
  selectDeployment,
  selectGit,
  selectPackageManager,
  selectRouterType,
  selectTailwind,
  selectToolchain,
  selectTypescript,
} from './ui-prompts.js'

import {
  getCurrentDirectoryName,
  sanitizePackageName,
  validateProjectName,
} from './utils.js'
import type { Options } from '@tanstack/create'

import type { CliOptions } from './types.js'

export async function promptForCreateOptions(
  cliOptions: CliOptions,
  {
    forcedAddOns = [],
    forcedMode,
    showDeploymentOptions = false,
  }: {
    forcedAddOns?: Array<string>
    forcedMode?: string
    showDeploymentOptions?: boolean
  },
): Promise<Required<Options> | undefined> {
  const options = {} as Required<Options>

  options.framework = getFrameworkById(cliOptions.framework || 'react-cra')!

  // Validate project name
  if (cliOptions.projectName) {
    // Handle "." as project name - use sanitized current directory name
    if (cliOptions.projectName === '.') {
      options.projectName = sanitizePackageName(getCurrentDirectoryName())
    } else {
      options.projectName = cliOptions.projectName
    }
    const { valid, error } = validateProjectName(options.projectName)
    if (!valid) {
      console.error(error)
      process.exit(1)
    }
  } else {
    options.projectName = await getProjectName()
  }

  // Check if target directory is empty
  if (
    !cliOptions.force &&
    fs.existsSync(options.projectName) &&
    fs.readdirSync(options.projectName).length > 0
  ) {
    const shouldContinue = await confirm({
      message: `Target directory ${options.projectName} is not empty. Do you want to continue?`,
      initialValue: true,
    })

    if (isCancel(shouldContinue) || !shouldContinue) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
  }

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

  // Deployment selection
  const deployment = showDeploymentOptions
    ? await selectDeployment(options.framework, cliOptions.deployment)
    : undefined

  // Add-ons selection
  const addOns: Set<string> = new Set()

  if (toolchain) {
    addOns.add(toolchain)
  }
  if (deployment) {
    addOns.add(deployment)
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
      'Would you like an example?',
      forcedAddOns,
      false,
    )) {
      addOns.add(addOn)
    }
  }

  options.chosenAddOns = Array.from(
    await finalizeAddOns(options.framework, options.mode, Array.from(addOns)),
  )

  if (options.chosenAddOns.length) {
    options.typescript = true
  }

  // Tailwind selection
  // Only treat add-ons as requiring tailwind if they explicitly have "tailwind": true
  const addOnsRequireTailwind = options.chosenAddOns.some(
    (addOn) => addOn.tailwind === true,
  )

  if (addOnsRequireTailwind) {
    // If any add-on explicitly requires tailwind, enable it automatically
    options.tailwind = true
  } else if (cliOptions.tailwind !== undefined) {
    // User explicitly provided a CLI flag, respect it
    options.tailwind = !!cliOptions.tailwind
  } else if (options.framework.id === 'react-cra') {
    // Only show prompt for react-cra when no CLI flag and no add-ons require it
    options.tailwind = await selectTailwind()
  } else {
    // For other frameworks (like solid), default to true
    options.tailwind = true
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
  if (cliOptions.install === false) {
    options.install = false
  }

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
