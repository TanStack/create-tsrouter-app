import { resolve } from 'node:path'
import fs from 'node:fs'

import {
  DEFAULT_PACKAGE_MANAGER,
  finalizeAddOns,
  getFrameworkById,
  getPackageManager,
  loadStarter,
  populateAddOnOptionsDefaults,
} from '@tanstack/cta-engine'

import {
  getCurrentDirectoryName,
  sanitizePackageName,
  validateProjectName,
} from './utils.js'
import type { Options } from '@tanstack/cta-engine'

import type { CliOptions } from './types.js'

export async function normalizeOptions(
  cliOptions: CliOptions,
  forcedMode?: string,
  forcedAddOns?: Array<string>,
  opts?: {
    disableNameCheck?: boolean
    forcedDeployment?: string
  },
): Promise<Options | undefined> {
  let projectName = (cliOptions.projectName ?? '').trim()
  let targetDir: string

  // Handle "." as project name - use current directory
  if (projectName === '.') {
    projectName = sanitizePackageName(getCurrentDirectoryName())
    targetDir = resolve(process.cwd())
  } else {
    targetDir = resolve(process.cwd(), projectName)
  }

  if (!projectName && !opts?.disableNameCheck) {
    return undefined
  }

  if (projectName) {
    const { valid, error } = validateProjectName(projectName)
    if (!valid) {
      console.error(error)
      process.exit(1)
    }
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
      cliOptions.deployment
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
      if (cliOptions.deployment) {
        selectedAddOns.add(cliOptions.deployment)
      }

      if (!cliOptions.deployment && opts?.forcedDeployment) {
        selectedAddOns.add(opts.forcedDeployment)
      }

      return await finalizeAddOns(framework, mode, Array.from(selectedAddOns))
    }

    return []
  }

  const chosenAddOns = await selectAddOns()

  if (chosenAddOns.length) {
    typescript = true

    // Check if any add-on explicitly requires tailwind
    const addOnsRequireTailwind = chosenAddOns.some(
      (addOn) => addOn.tailwind === true,
    )

    // Only set tailwind to true if:
    // 1. An add-on explicitly requires it, OR
    // 2. User explicitly set it via CLI
    if (addOnsRequireTailwind) {
      tailwind = true
    } else if (cliOptions.tailwind === true) {
      tailwind = true
    } else if (cliOptions.tailwind === false) {
      tailwind = false
    }
    // If cliOptions.tailwind is undefined and no add-ons require it,
    // leave tailwind as is (will be prompted in interactive mode)
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
    targetDir,
    framework,
    mode,
    typescript,
    tailwind,
    packageManager:
      cliOptions.packageManager ||
      getPackageManager() ||
      DEFAULT_PACKAGE_MANAGER,
    git: !!cliOptions.git,
    install: cliOptions.install,
    chosenAddOns,
    addOnOptions: {
      ...populateAddOnOptionsDefaults(chosenAddOns),
      ...addOnOptionsFromCLI,
    },
    starter: starter,
  }
}

export function validateDevWatchOptions(cliOptions: CliOptions): {
  valid: boolean
  error?: string
} {
  if (!cliOptions.devWatch) {
    return { valid: true }
  }

  // Validate watch path exists
  const watchPath = resolve(process.cwd(), cliOptions.devWatch)
  if (!fs.existsSync(watchPath)) {
    return {
      valid: false,
      error: `Watch path does not exist: ${watchPath}`,
    }
  }

  // Validate it's a directory
  const stats = fs.statSync(watchPath)
  if (!stats.isDirectory()) {
    return {
      valid: false,
      error: `Watch path is not a directory: ${watchPath}`,
    }
  }

  // Ensure target directory is specified
  if (!cliOptions.projectName && !cliOptions.targetDir) {
    return {
      valid: false,
      error: 'Project name or target directory is required for dev watch mode',
    }
  }

  // Check for framework structure
  const hasAddOns = fs.existsSync(resolve(watchPath, 'add-ons'))
  const hasAssets = fs.existsSync(resolve(watchPath, 'assets'))
  const hasFrameworkJson = fs.existsSync(resolve(watchPath, 'framework.json'))

  if (!hasAddOns && !hasAssets && !hasFrameworkJson) {
    return {
      valid: false,
      error: `Watch path does not appear to be a valid framework directory: ${watchPath}`,
    }
  }

  return { valid: true }
}
