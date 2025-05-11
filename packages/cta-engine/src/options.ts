import {
  cancel,
  confirm,
  isCancel,
  multiselect,
  select,
  text,
} from '@clack/prompts'

import {
  DEFAULT_PACKAGE_MANAGER,
  SUPPORTED_PACKAGE_MANAGERS,
  getPackageManager,
} from './package-manager.js'
import { DEFAULT_TOOLCHAIN, SUPPORTED_TOOLCHAINS } from './toolchain.js'
import { CODE_ROUTER, DEFAULT_FRAMEWORK, FILE_ROUTER } from './constants.js'
import { finalizeAddOns, getAllAddOns, loadRemoteAddOn } from './add-ons.js'

import type {
  AddOn,
  CliOptions,
  Mode,
  Options,
  Overlay,
  TemplateOptions,
  Variable,
} from './types.js'

// If all CLI options are provided, use them directly
export async function normalizeOptions(
  cliOptions: CliOptions,
  forcedMode?: Mode,
  forcedAddOns?: Array<string>,
): Promise<Options | undefined> {
  // in some cases, if you use windows/powershell, the argument for addons
  // if sepparated by comma is not really passed as an array, but as a string
  // with spaces, We need to normalize this edge case.
  if (Array.isArray(cliOptions.addOns) && cliOptions.addOns.length === 1) {
    const parseSeparatedArgs = cliOptions.addOns[0].split(' ')
    if (parseSeparatedArgs.length > 1) {
      cliOptions.addOns = parseSeparatedArgs
    }
  }

  if (cliOptions.projectName) {
    let typescript =
      cliOptions.template === 'typescript' ||
      cliOptions.template === 'file-router' ||
      cliOptions.framework === 'solid'

    let tailwind = !!cliOptions.tailwind
    if (cliOptions.framework === 'solid') {
      tailwind = true
    }

    let mode: typeof FILE_ROUTER | typeof CODE_ROUTER =
      cliOptions.template === 'file-router' ? FILE_ROUTER : CODE_ROUTER

    const overlay = cliOptions.overlay
      ? ((await loadRemoteAddOn(cliOptions.overlay)) as Overlay)
      : undefined

    if (overlay) {
      tailwind = overlay.tailwind
      typescript = overlay.typescript
      cliOptions.framework = overlay.framework
      mode = overlay.mode
    }

    let addOns = false
    let chosenAddOns: Array<AddOn> = []
    if (
      Array.isArray(cliOptions.addOns) ||
      overlay?.dependsOn ||
      forcedAddOns
    ) {
      addOns = true
      let finalAddOns = Array.from(
        new Set([...(overlay?.dependsOn || []), ...(forcedAddOns || [])]),
      )
      if (cliOptions.addOns && Array.isArray(cliOptions.addOns)) {
        finalAddOns = Array.from(
          new Set([
            ...(forcedAddOns || []),
            ...finalAddOns,
            ...cliOptions.addOns,
          ]),
        )
      }
      chosenAddOns = await finalizeAddOns(
        cliOptions.framework || DEFAULT_FRAMEWORK,
        forcedMode || cliOptions.template === 'file-router'
          ? FILE_ROUTER
          : CODE_ROUTER,
        finalAddOns,
      )
      tailwind = true
      typescript = true
    }

    return {
      framework: cliOptions.framework || 'react',
      projectName: cliOptions.projectName,
      typescript,
      tailwind,
      packageManager:
        cliOptions.packageManager ||
        getPackageManager() ||
        DEFAULT_PACKAGE_MANAGER,
      toolchain: cliOptions.toolchain || DEFAULT_TOOLCHAIN,
      mode,
      git: !!cliOptions.git,
      addOns,
      chosenAddOns,
      variableValues: {},
      overlay,
    }
  }
}

async function collectVariables(
  variables: Array<Variable>,
): Promise<Record<string, string | number | boolean>> {
  const responses: Record<string, string | number | boolean> = {}
  for (const variable of variables) {
    if (variable.type === 'string') {
      const response = await text({
        message: variable.description,
        initialValue: variable.default,
      })
      if (isCancel(response)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }
      responses[variable.name] = response
    } else if (variable.type === 'number') {
      const response = await text({
        message: variable.description,
        initialValue: variable.default.toString(),
      })
      if (isCancel(response)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }
      responses[variable.name] = Number(response)
    } else {
      const response = await confirm({
        message: variable.description,
        initialValue: variable.default === true,
      })
      if (isCancel(response)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }
      responses[variable.name] = response
    }
  }
  return responses
}

export async function promptForOptions(
  cliOptions: CliOptions,
  {
    forcedAddOns = [],
    forcedMode,
  }: {
    forcedAddOns?: Array<string>
    forcedMode?: TemplateOptions
  },
): Promise<Required<Options> | undefined> {
  const options = {} as Required<Options>

  options.framework = cliOptions.framework || DEFAULT_FRAMEWORK
  if (options.framework === 'solid') {
    options.typescript = true
    options.tailwind = true
  }

  if (cliOptions.addOns) {
    options.typescript = true
  }

  if (!cliOptions.projectName) {
    const value = await text({
      message: 'What would you like to name your project?',
      defaultValue: 'my-app',
      validate(value) {
        if (!value) {
          return 'Please enter a name'
        }
      },
    })
    if (isCancel(value)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    options.projectName = value
  } else {
    options.projectName = cliOptions.projectName
  }

  // Router type selection
  if (!cliOptions.template && !forcedMode) {
    const routerType = await select({
      message: 'Select the router type:',
      options: [
        {
          value: FILE_ROUTER,
          label: 'File Router - File-based routing structure',
        },
        {
          value: CODE_ROUTER,
          label: 'Code Router - Traditional code-based routing',
        },
      ],
      initialValue: FILE_ROUTER,
    })
    if (isCancel(routerType)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    options.mode = routerType as typeof CODE_ROUTER | typeof FILE_ROUTER
  } else if (forcedMode) {
    options.mode = forcedMode === 'file-router' ? FILE_ROUTER : CODE_ROUTER
    options.typescript = options.mode === FILE_ROUTER
  } else {
    options.mode =
      cliOptions.template === 'file-router' ? FILE_ROUTER : CODE_ROUTER
    if (options.mode === FILE_ROUTER) {
      options.typescript = true
    }
  }

  // TypeScript selection (if using Code Router)
  if (!options.typescript) {
    if (options.mode === CODE_ROUTER) {
      const typescriptEnable = await confirm({
        message: 'Would you like to use TypeScript?',
        initialValue: true,
      })
      if (isCancel(typescriptEnable)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }
      options.typescript = typescriptEnable
    } else {
      options.typescript = true
    }
  }

  // Package manager selection
  if (cliOptions.packageManager === undefined) {
    const detectedPackageManager = getPackageManager()
    if (!detectedPackageManager) {
      const pm = await select({
        message: 'Select package manager:',
        options: SUPPORTED_PACKAGE_MANAGERS.map((pm) => ({
          value: pm,
          label: pm,
        })),
        initialValue: DEFAULT_PACKAGE_MANAGER,
      })
      if (isCancel(pm)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }
      options.packageManager = pm
    } else {
      options.packageManager = detectedPackageManager
    }
  } else {
    options.packageManager = cliOptions.packageManager
  }

  // Toolchain selection
  if (cliOptions.toolchain === undefined) {
    const tc = await select({
      message: 'Select toolchain',
      options: SUPPORTED_TOOLCHAINS.map((tc) => ({
        value: tc,
        label: tc,
      })),
      initialValue: DEFAULT_TOOLCHAIN,
    })
    if (isCancel(tc)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    options.toolchain = tc
  } else {
    options.toolchain = cliOptions.toolchain
  }

  options.chosenAddOns = []
  if (Array.isArray(cliOptions.addOns)) {
    options.chosenAddOns = await finalizeAddOns(
      options.framework,
      options.mode,
      Array.from(new Set([...cliOptions.addOns, ...forcedAddOns])),
    )
    options.tailwind = true
  } else if (cliOptions.addOns) {
    // Select any add-ons
    const allAddOns = await getAllAddOns(options.framework, options.mode)
    const addOns = allAddOns.filter((addOn) => addOn.type === 'add-on')
    let selectedAddOns: Array<string> = []
    if (options.typescript && addOns.length > 0) {
      const value = await multiselect({
        message: 'What add-ons would you like for your project:',
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
      selectedAddOns = value
    }

    // Select any examples
    let selectedExamples: Array<string> = []
    const examples = allAddOns.filter((addOn) => addOn.type === 'example')
    if (options.typescript && examples.length > 0) {
      const value = await multiselect({
        message: 'Would you like any examples?',
        options: examples
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
      selectedExamples = value
    }

    if (
      selectedAddOns.length > 0 ||
      selectedExamples.length > 0 ||
      forcedAddOns.length > 0
    ) {
      options.chosenAddOns = await finalizeAddOns(
        options.framework,
        options.mode,
        Array.from(
          new Set([...selectedAddOns, ...selectedExamples, ...forcedAddOns]),
        ),
      )
      options.tailwind = true
    }
  } else if (forcedAddOns.length > 0) {
    options.chosenAddOns = await finalizeAddOns(
      options.framework,
      options.mode,
      forcedAddOns,
    )
  }

  // Tailwind selection
  if (
    !cliOptions.tailwind &&
    !options.tailwind &&
    options.framework === 'react'
  ) {
    const tailwind = await confirm({
      message: 'Would you like to use Tailwind CSS?',
      initialValue: true,
    })
    if (isCancel(tailwind)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    options.tailwind = tailwind
  } else {
    options.tailwind =
      options.framework === 'solid' ||
      !!cliOptions.tailwind ||
      !!options.tailwind
  }

  // Collect variables
  const variables: Array<Variable> = []
  for (const addOn of options.chosenAddOns) {
    for (const variable of addOn.variables ?? []) {
      variables.push(variable)
    }
  }
  options.variableValues = await collectVariables(variables)

  // Git selection
  if (cliOptions.git === undefined) {
    const git = await confirm({
      message: 'Would you like to initialize a new git repository?',
      initialValue: true,
    })
    if (isCancel(git)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }
    options.git = git
  } else {
    options.git = !!cliOptions.git
  }

  return options
}
