import { resolve, sep } from 'node:path'
import { render } from 'ejs'
import { format } from 'prettier'

import { formatCommand } from './utils.js'
import {
  getPackageManagerInstallCommand,
  getPackageManagerScriptCommand,
} from './package-manager.js'
import { relativePath } from './file-helpers.js'

import type { AddOn, Environment, Options } from './types.js'

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

  const integrations: Array<Required<AddOn>['integrations'][number]> = []
  for (const addOn of options.chosenAddOns) {
    if (addOn.integrations) {
      for (const integration of addOn.integrations) {
        integrations.push(integration)
      }
    }
  }

  const routes: Array<Required<AddOn>['routes'][number]> = []
  for (const addOn of options.chosenAddOns) {
    if (addOn.routes) {
      routes.push(...addOn.routes)
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
      addOnOption: options.addOnOptions,
      addOns: options.chosenAddOns,
      integrations,
      routes,

      getPackageManagerAddScript,
      getPackageManagerRunScript,

      relativePath: (path: string, stripExtension: boolean = false) =>
        relativePath(file, path, stripExtension),

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

    // Strip option prefixes from filename (e.g., __postgres__drizzle.config.ts -> drizzle.config.ts)
    const prefixMatch = target.match(/^(.+\/)?__([^_]+)__(.+)$/)
    if (prefixMatch) {
      const [, directory, , filename] = prefixMatch
      target = (directory || '') + filename
    }

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
