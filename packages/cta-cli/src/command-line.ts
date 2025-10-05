import { resolve } from 'node:path'

import {
  DEFAULT_PACKAGE_MANAGER,
  finalizeAddOns,
  getFrameworkById,
  getPackageManager,
  loadStarter,
  populateAddOnOptionsDefaults,
} from '@tanstack/cta-engine'

import type { Options } from '@tanstack/cta-engine'

import type { CliOptions } from './types.js'

export async function normalizeOptions(
  cliOptions: CliOptions,
  forcedMode?: string,
  forcedAddOns?: Array<string>,
  opts?: {
    disableNameCheck?: boolean
  },
): Promise<Options | undefined> {
  const projectName = (cliOptions.projectName ?? '').trim()
  if (!projectName && !opts?.disableNameCheck) {
    return undefined
  }

  let tailwind = !!cliOptions.tailwind

  let mode: string =
    forcedMode ||
    (cliOptions.template === 'file-router' ? 'file-router' : 'code-router')

  const starter = cliOptions.starter
    ? await loadStarter(cliOptions.starter)
    : undefined

  // TODO: Make this declarative
  let typescript =
    cliOptions.template === 'typescript' ||
    cliOptions.template === 'file-router' ||
    cliOptions.framework === 'solid'

  if (starter) {
    tailwind = starter.tailwind
    typescript = starter.typescript
    cliOptions.framework = starter.framework
    mode = starter.mode
  }

  const framework = getFrameworkById(cliOptions.framework || 'react-cra')!

  if (
    forcedMode &&
    framework.supportedModes?.[forcedMode]?.forceTypescript !== undefined
  ) {
    typescript = true
  }

  if (cliOptions.framework === 'solid') {
    tailwind = true
  }

  async function selectAddOns() {
    // Edge case for Windows Powershell
    if (Array.isArray(cliOptions.addOns) && cliOptions.addOns.length === 1) {
      const parseSeparatedArgs = cliOptions.addOns[0].split(' ')
      if (parseSeparatedArgs.length > 1) {
        cliOptions.addOns = parseSeparatedArgs
      }
    }

    if (
      Array.isArray(cliOptions.addOns) ||
      starter?.dependsOn ||
      forcedAddOns ||
      cliOptions.toolchain ||
      cliOptions.host
    ) {
      const selectedAddOns = new Set<string>([
        ...(starter?.dependsOn || []),
        ...(forcedAddOns || []),
      ])
      if (cliOptions.addOns && Array.isArray(cliOptions.addOns)) {
        for (const a of cliOptions.addOns) {
          selectedAddOns.add(a)
        }
      }
      if (cliOptions.toolchain) {
        selectedAddOns.add(cliOptions.toolchain)
      }
      if (cliOptions.host) {
        selectedAddOns.add(cliOptions.host)
      }

      if (!cliOptions.host) {
        selectedAddOns.add('nitro')
      }

      return await finalizeAddOns(framework, mode, Array.from(selectedAddOns))
    }

    return []
  }

  const chosenAddOns = await selectAddOns()

  if (chosenAddOns.length) {
    tailwind = true
    typescript = true
  }

  // Handle add-on configuration option
  let addOnOptionsFromCLI = {}
  if (cliOptions.addOnConfig) {
    try {
      addOnOptionsFromCLI = JSON.parse(cliOptions.addOnConfig)
    } catch (error) {
      console.error('Error parsing add-on config:', error)
      process.exit(1)
    }
  }

  return {
    projectName: projectName,
    targetDir: resolve(process.cwd(), projectName),
    framework,
    mode,
    typescript,
    tailwind,
    packageManager:
      cliOptions.packageManager ||
      getPackageManager() ||
      DEFAULT_PACKAGE_MANAGER,
    git: !!cliOptions.git,
    chosenAddOns,
    addOnOptions: {
      ...populateAddOnOptionsDefaults(chosenAddOns),
      ...addOnOptionsFromCLI
    },
    starter: starter,
  }
}
