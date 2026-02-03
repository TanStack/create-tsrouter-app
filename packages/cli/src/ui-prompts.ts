import {
  cancel,
  confirm,
  isCancel,
  multiselect,
  note,
  select,
  text,
} from '@clack/prompts'

import {
  DEFAULT_PACKAGE_MANAGER,
  SUPPORTED_PACKAGE_MANAGERS,
  getAllAddOns,
} from '@tanstack/create'

import { validateProjectName } from './utils.js'
import type { AddOn, PackageManager } from '@tanstack/create'

import type { Framework } from '@tanstack/create/dist/types/types.js'

export async function getProjectName(): Promise<string> {
  const value = await text({
    message: 'What would you like to name your project?',
    defaultValue: 'my-app',
    validate(value) {
      if (!value) {
        return 'Please enter a name'
      }

      const { valid, error } = validateProjectName(value)
      if (!valid) {
        return error
      }
    },
  })

  if (isCancel(value)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return value
}

export async function selectPackageManager(): Promise<PackageManager> {
  const packageManager = await select({
    message: 'Select package manager:',
    options: SUPPORTED_PACKAGE_MANAGERS.map((pm) => ({
      value: pm,
      label: pm,
    })),
    initialValue: DEFAULT_PACKAGE_MANAGER,
  })
  if (isCancel(packageManager)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }
  return packageManager
}

// Track if we've shown the multiselect help text
let hasShownMultiselectHelp = false

export async function selectAddOns(
  framework: Framework,
  mode: string,
  type: string,
  message: string,
  forcedAddOns: Array<string> = [],
  allowMultiple: boolean = true,
): Promise<Array<string>> {
  const allAddOns = await getAllAddOns(framework, mode)
  const addOns = allAddOns.filter((addOn) => addOn.type === type)
  if (addOns.length === 0) {
    return []
  }

  // Show help text only once
  if (!hasShownMultiselectHelp) {
    note(
      'Use ↑/↓ to navigate • Space to select/deselect • Enter to confirm',
      'Keyboard Shortcuts',
    )
    hasShownMultiselectHelp = true
  }

  if (allowMultiple) {
    const value = await multiselect({
      message,
      options: addOns
        .filter((addOn) => !forcedAddOns.includes(addOn.id))
        .map((addOn) => ({
          value: addOn.id,
          label: addOn.name,
          hint: addOn.description,
        })),
      required: false,
    })

    if (isCancel(value)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    return value
  } else {
    const value = await select({
      message,
      options: [
        {
          value: 'none',
          label: 'None',
        },
        ...addOns
          .filter((addOn) => !forcedAddOns.includes(addOn.id))
          .map((addOn) => ({
            value: addOn.id,
            label: addOn.name,
            hint: addOn.description,
          })),
      ],
      initialValue: 'none',
    })

    if (isCancel(value)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    return value === 'none' ? [] : [value]
  }
}

export async function selectGit(): Promise<boolean> {
  const git = await confirm({
    message: 'Would you like to initialize a new git repository?',
    initialValue: true,
  })
  if (isCancel(git)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }
  return git
}

export async function selectToolchain(
  framework: Framework,
  toolchain?: string | false,
): Promise<string | undefined> {
  if (toolchain === false) {
    return undefined
  }

  const toolchains = new Set<AddOn>()
  for (const addOn of framework.getAddOns()) {
    if (addOn.type === 'toolchain') {
      toolchains.add(addOn)
      if (toolchain && addOn.id === toolchain) {
        return toolchain
      }
    }
  }

  const tc = await select({
    message: 'Select toolchain',
    options: [
      {
        value: undefined,
        label: 'None',
      },
      ...Array.from(toolchains).map((tc) => ({
        value: tc.id,
        label: tc.name,
      })),
    ],
    initialValue: undefined,
  })

  if (isCancel(tc)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return tc
}

export async function promptForAddOnOptions(
  addOnIds: Array<string>,
  framework: Framework,
): Promise<Record<string, Record<string, any>>> {
  const addOnOptions: Record<string, Record<string, any>> = {}

  for (const addOnId of addOnIds) {
    const addOn = framework.getAddOns().find((a) => a.id === addOnId)
    if (!addOn || !addOn.options) continue

    addOnOptions[addOnId] = {}

    for (const [optionName, option] of Object.entries(addOn.options)) {
      if (option && typeof option === 'object' && 'type' in option) {
        if (option.type === 'select') {
          const selectOption = option as {
            type: 'select'
            label: string
            description?: string
            default: string
            options: Array<{ value: string; label: string }>
          }

          const value = await select({
            message: `${addOn.name}: ${selectOption.label}`,
            options: selectOption.options.map((opt) => ({
              value: opt.value,
              label: opt.label,
            })),
            initialValue: selectOption.default,
          })

          if (isCancel(value)) {
            cancel('Operation cancelled.')
            process.exit(0)
          }

          addOnOptions[addOnId][optionName] = value
        }
        // Future option types can be added here
      }
    }
  }

  return addOnOptions
}

export async function selectDeployment(
  framework: Framework,
  deployment?: string,
): Promise<string | undefined> {
  const deployments = new Set<AddOn>()
  let initialValue: string | undefined = undefined
  for (const addOn of framework
    .getAddOns()
    .sort((a, b) => a.name.localeCompare(b.name))) {
    if (addOn.type === 'deployment') {
      deployments.add(addOn)
      if (deployment && addOn.id === deployment) {
        return deployment
      }
      if (addOn.default) {
        initialValue = addOn.id
      }
    }
  }

  const dp = await select({
    message: 'Select deployment adapter',
    options: [
      ...Array.from(deployments).map((d) => ({
        value: d.id,
        label: d.name,
      })),
    ],
    initialValue: initialValue,
  })

  if (isCancel(dp)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  return dp
}
