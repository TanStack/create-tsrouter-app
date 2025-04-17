import {
  CODE_ROUTER,
  FILE_ROUTER,
  finalizeAddOns,
  getFrameworkById,
  getPackageManager,
} from '@tanstack/cta-engine'

import {
  getProjectName,
  selectAddOns,
  selectGit,
  selectPackageManager,
  selectRouterType,
  selectTailwind,
  selectToolchain,
  selectTypescript,
} from './ui-prompts.js'

import type { Mode, Options } from '@tanstack/cta-engine'

import type { CliOptions } from './types.js'

export async function promptForOptions(
  cliOptions: CliOptions,
  {
    forcedAddOns = [],
    forcedMode,
  }: {
    forcedAddOns?: Array<string>
    forcedMode?: Mode
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
      cliOptions.template === 'file-router' ? FILE_ROUTER : CODE_ROUTER
  } else {
    options.mode = await selectRouterType()
  }

  // TypeScript selection (if using Code Router)
  options.typescript =
    options.mode === FILE_ROUTER || options.framework.id === 'solid'
  if (!options.typescript && options.mode === CODE_ROUTER) {
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

  // Add-ons selection
  const addOns: Set<string> = new Set()

  if (toolchain) {
    addOns.add(toolchain)
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

  options.variableValues = {}

  options.git = cliOptions.git || (await selectGit())

  return options
}
