import { resolve } from 'node:path'
import { render } from 'ejs'
import { format } from 'prettier'

import {
  CODE_ROUTER,
  FILE_ROUTER,
  formatCommand,
  getPackageManagerExecuteCommand,
  getPackageManagerInstallCommand,
  relativePath,
} from '@tanstack/cta-core'

import type { AddOn, Environment, Options } from '@tanstack/cta-core'

function convertDotFilesAndPaths(path: string) {
  return path
    .split('/')
    .map((segment) => segment.replace(/^_dot_/, '.'))
    .join('/')
}

export function createTemplateFile(
  environment: Environment,
  options: Options,
  targetDir: string,
) {
  function getPackageManagerAddScript(
    packageName: string,
    isDev: boolean = false,
  ) {
    const { command, args } = getPackageManagerInstallCommand(
      options.packageManager,
      packageName,
      isDev,
    )
    return formatCommand(command, args)
  }
  function getPackageManagerRunScript(scriptName: string) {
    const { command, args } = getPackageManagerExecuteCommand(
      options.packageManager,
      scriptName,
    )
    return formatCommand(command, args)
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

  return async function templateFile(file: string, content: string) {
    const templateValues = {
      packageManager: options.packageManager,
      projectName: options.projectName,
      typescript: options.typescript,
      tailwind: options.tailwind,
      js: options.typescript ? 'ts' : 'js',
      jsx: options.typescript ? 'tsx' : 'jsx',
      fileRouter: options.mode === FILE_ROUTER,
      codeRouter: options.mode === CODE_ROUTER,
      addOnEnabled: options.chosenAddOns.reduce<Record<string, boolean>>(
        (acc, addOn) => {
          acc[addOn.id] = true
          return acc
        },
        {},
      ),
      addOns: options.chosenAddOns,
      integrations,
      routes,

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
      target = target.replace(/\.tsx?$/, '.jsx').replace(/\.ts$/, '.js')
    }

    if (append) {
      await environment.appendFile(resolve(targetDir, target), content)
    } else {
      await environment.writeFile(resolve(targetDir, target), content)
    }
  }
}
