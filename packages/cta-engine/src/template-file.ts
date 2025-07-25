import { resolve, sep } from 'node:path'
import { render } from 'ejs'
import { format } from 'prettier'

import { formatCommand } from './utils.js'
import {
  getPackageManagerInstallCommand,
  getPackageManagerScriptCommand,
} from './package-manager.js'
import { relativePath } from './file-helpers.js'

import type { Environment, Options } from './types.js'

function convertDotFilesAndPaths(path: string) {
  return path
    .split(sep)
    .map((segment) => segment.replace(/^_dot_/, '.'))
    .join(sep)
}

export function createTemplateFile(environment: Environment, options: Options) {
  function getPackageManagerAddScript(
    packageName: string,
    isDev: boolean = false,
  ) {
    return formatCommand(
      getPackageManagerInstallCommand(
        options.packageManager,
        packageName,
        isDev,
      ),
    )
  }
  function getPackageManagerRunScript(
    scriptName: string,
    args: Array<string> = [],
  ) {
    return formatCommand(
      getPackageManagerScriptCommand(options.packageManager, [
        scriptName,
        ...args,
      ]),
    )
  }

  class IgnoreFileError extends Error {
    constructor() {
      super('ignoreFile')
      this.name = 'IgnoreFileError'
    }
  }

  // Collect all custom properties from add-ons
  const customProperties: Record<string, Array<unknown>> = {}

  // Initialize arrays for all framework custom properties
  if (options.framework.customProperties) {
    for (const key of Object.keys(options.framework.customProperties)) {
      customProperties[key] = []
    }
  }

  // Collect custom properties from each add-on
  for (const addOn of options.chosenAddOns) {
    if (addOn.customProperties) {
      for (const [key, values] of Object.entries(addOn.customProperties)) {
        // Initialize array if it doesn't exist (for properties not defined in framework)
        if (!(key in customProperties)) {
          customProperties[key] = []
        }

        // Add values to the array
        if (Array.isArray(values)) {
          customProperties[key].push(...values)
        } else {
          customProperties[key].push(values)
        }
      }
    }
  }

  const addOnEnabled = options.chosenAddOns.reduce<Record<string, boolean>>(
    (acc, addOn) => {
      acc[addOn.id] = true
      return acc
    },
    {},
  )

  return async function templateFile(file: string, content: string) {
    const templateValues = {
      packageManager: options.packageManager,
      projectName: options.projectName,
      typescript: options.typescript,
      tailwind: options.tailwind,
      js: options.typescript ? 'ts' : 'js',
      jsx: options.typescript ? 'tsx' : 'jsx',
      fileRouter: options.mode === 'file-router',
      codeRouter: options.mode === 'code-router',
      addOnEnabled,
      addOns: options.chosenAddOns,

      // Spread custom properties to make them available at top level
      ...customProperties,

      getPackageManagerAddScript,
      getPackageManagerRunScript,

      relativePath: (path: string) => relativePath(file, path),

      ignoreFile: () => {
        throw new IgnoreFileError()
      },
    }

    let ignoreFile = false

    if (file.endsWith('.ejs')) {
      try {
        content = render(content, templateValues)
      } catch (error) {
        if (error instanceof IgnoreFileError) {
          ignoreFile = true
        } else {
          console.error(file, error)
          environment.error(`EJS error in file ${file}`, error?.toString())
          process.exit(1)
        }
      }
    }

    if (ignoreFile) {
      return
    }

    let target = convertDotFilesAndPaths(file.replace('.ejs', ''))

    let append = false
    if (target.endsWith('.append')) {
      append = true
      target = target.replace('.append', '')
    }

    if (target.endsWith('.ts') || target.endsWith('.tsx')) {
      content = await format(content, {
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        parser: 'typescript',
      })
    }

    if (!options.typescript) {
      target = target.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js')
    }

    if (append) {
      await environment.appendFile(resolve(options.targetDir, target), content)
    } else {
      await environment.writeFile(resolve(options.targetDir, target), content)
    }
  }
}
