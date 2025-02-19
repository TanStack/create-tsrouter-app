#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command, InvalidArgumentError } from 'commander'
import { confirm, intro, log, outro, select, spinner } from '@clack/prompts'
import { execa } from 'execa'
import { render } from 'ejs'

import {
  SUPPORTED_PACKAGE_MANAGERS,
  getPackageManager,
} from './utils/getPackageManager.js'

import type { PackageManager } from './utils/getPackageManager.js'

const program = new Command()

const CODE_ROUTER = 'code-router'
const FILE_ROUTER = 'file-router'

interface Options {
  typescript: boolean
  tailwind: boolean
  packageManager: PackageManager
  mode: typeof CODE_ROUTER | typeof FILE_ROUTER
}

interface CliOptions {
  template?: 'typescript' | 'javascript' | 'file-router'
  tailwind?: boolean
  packageManager?: PackageManager
}

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

function createCopyFile(targetDir: string) {
  return async function copyFiles(templateDir: string, files: Array<string>) {
    for (const file of files) {
      const targetFileName = file.replace('.tw', '')
      await copyFile(
        resolve(templateDir, file),
        resolve(targetDir, targetFileName),
      )
    }
  }
}

function createTemplateFile(
  projectName: string,
  options: Required<Options>,
  targetDir: string,
) {
  return async function templateFile(
    templateDir: string,
    file: string,
    targetFileName?: string,
  ) {
    const templateValues = {
      packageManager: options.packageManager,
      projectName: projectName,
      typescript: options.typescript,
      tailwind: options.tailwind,
      js: options.typescript ? 'ts' : 'js',
      jsx: options.typescript ? 'tsx' : 'jsx',
      fileRouter: options.mode === FILE_ROUTER,
      codeRouter: options.mode === CODE_ROUTER,
    }

    const template = await readFile(resolve(templateDir, file), 'utf-8')
    const content = render(template, templateValues)
    const target = targetFileName ?? file.replace('.ejs', '')
    await writeFile(resolve(targetDir, target), content)
  }
}

async function createPackageJSON(
  projectName: string,
  options: Required<Options>,
  templateDir: string,
  routerDir: string,
  targetDir: string,
) {
  let packageJSON = JSON.parse(
    await readFile(resolve(templateDir, 'package.json'), 'utf8'),
  )
  packageJSON.name = projectName
  if (options.typescript) {
    const tsPackageJSON = JSON.parse(
      await readFile(resolve(templateDir, 'package.ts.json'), 'utf8'),
    )
    packageJSON = {
      ...packageJSON,
      devDependencies: {
        ...packageJSON.devDependencies,
        ...tsPackageJSON.devDependencies,
      },
    }
  }
  if (options.tailwind) {
    const twPackageJSON = JSON.parse(
      await readFile(resolve(templateDir, 'package.tw.json'), 'utf8'),
    )
    packageJSON = {
      ...packageJSON,
      dependencies: {
        ...packageJSON.dependencies,
        ...twPackageJSON.dependencies,
      },
    }
  }
  if (options.mode === FILE_ROUTER) {
    const frPackageJSON = JSON.parse(
      await readFile(resolve(routerDir, 'package.fr.json'), 'utf8'),
    )
    packageJSON = {
      ...packageJSON,
      dependencies: {
        ...packageJSON.dependencies,
        ...frPackageJSON.dependencies,
      },
    }
  }
  packageJSON.dependencies = sortObject(
    packageJSON.dependencies as Record<string, string>,
  )
  packageJSON.devDependencies = sortObject(
    packageJSON.devDependencies as Record<string, string>,
  )
  await writeFile(
    resolve(targetDir, 'package.json'),
    JSON.stringify(packageJSON, null, 2),
  )
}

async function createApp(projectName: string, options: Required<Options>) {
  const templateDirBase = fileURLToPath(
    new URL('../templates/base', import.meta.url),
  )
  const templateDirRouter = fileURLToPath(
    new URL(`../templates/${options.mode}`, import.meta.url),
  )
  const targetDir = resolve(process.cwd(), projectName)

  if (existsSync(targetDir)) {
    log.error(`Directory "${projectName}" already exists`)
    return
  }

  const copyFiles = createCopyFile(targetDir)
  const templateFile = createTemplateFile(projectName, options, targetDir)

  intro(`Creating a new TanStack app in ${targetDir}...`)

  // Make the root directory
  await mkdir(targetDir, { recursive: true })

  // Setup the .vscode directory
  await mkdir(resolve(targetDir, '.vscode'), { recursive: true })
  await copyFile(
    resolve(templateDirBase, '.vscode/settings.json'),
    resolve(targetDir, '.vscode/settings.json'),
  )

  // Fill the public directory
  await mkdir(resolve(targetDir, 'public'), { recursive: true })
  copyFiles(templateDirBase, [
    './public/robots.txt',
    './public/favicon.ico',
    './public/manifest.json',
    './public/logo192.png',
    './public/logo512.png',
  ])

  // Make the src directory
  await mkdir(resolve(targetDir, 'src'), { recursive: true })
  if (options.mode === FILE_ROUTER) {
    await mkdir(resolve(targetDir, 'src/routes'), { recursive: true })
  }

  // Copy in Vite and Tailwind config and CSS
  if (!options.tailwind) {
    await copyFiles(templateDirBase, ['./src/App.css'])
  }
  await templateFile(templateDirBase, './vite.config.js.ejs')
  await templateFile(templateDirBase, './src/styles.css.ejs')

  copyFiles(templateDirBase, ['./src/logo.svg'])

  // Setup the app component. There are four variations, typescript/javascript and tailwind/non-tailwind.
  if (options.mode === FILE_ROUTER) {
    copyFiles(templateDirRouter, ['./src/routes/__root.tsx'])
    await templateFile(
      templateDirBase,
      './src/App.tsx.ejs',
      './src/routes/index.tsx',
    )
  } else {
    await templateFile(
      templateDirBase,
      './src/App.tsx.ejs',
      options.typescript ? undefined : './src/App.jsx',
    )
    await templateFile(
      templateDirBase,
      './src/App.test.tsx.ejs',
      options.typescript ? undefined : './src/App.test.jsx',
    )
  }

  // Create the main entry point
  if (options.typescript) {
    await templateFile(templateDirRouter, './src/main.tsx.ejs')
  } else {
    await templateFile(
      templateDirRouter,
      './src/main.tsx.ejs',
      './src/main.jsx',
    )
  }

  // Setup the main, reportWebVitals and index.html files
  if (options.typescript) {
    await templateFile(templateDirBase, './src/reportWebVitals.ts.ejs')
  } else {
    await templateFile(
      templateDirBase,
      './src/reportWebVitals.ts.ejs',
      './src/reportWebVitals.js',
    )
  }
  await templateFile(templateDirBase, './index.html.ejs')

  // Setup tsconfig
  if (options.typescript) {
    await copyFiles(templateDirBase, ['./tsconfig.json'])
  }

  // Setup the package.json file, optionally with typescript and tailwind
  await createPackageJSON(
    projectName,
    options,
    templateDirBase,
    templateDirRouter,
    targetDir,
  )

  // Add .gitignore
  await copyFile(
    resolve(templateDirBase, 'gitignore'),
    resolve(targetDir, '.gitignore'),
  )

  // Create the README.md
  await templateFile(templateDirBase, 'README.md.ejs')

  // Install dependencies
  const s = spinner()
  s.start(`Installing dependencies via ${options.packageManager}...`)
  await execa(options.packageManager, ['install'], { cwd: targetDir })
  s.stop(`Installed dependencies`)

  outro(`Created your new TanStack app in ${targetDir}.

Use the following commands to start your app:

% cd ${projectName}
% ${options.packageManager} start

Please read README.md for more information on testing, styling, adding routes, react-query, etc.
`)
}

async function promptForOptions(
  projectName: string,
  cliOptions: CliOptions,
): Promise<Required<Options>> {
  intro(`Creating a new TanStack app in ${projectName}...`)

  // Show info about provided flags
  if (cliOptions.template) {
    log.info(`Template: ${cliOptions.template}`)
  }
  if (cliOptions.packageManager) {
    log.info(`Package Manager: ${cliOptions.packageManager}`)
  }
  if (cliOptions.tailwind !== undefined) {
    log.info(`Tailwind CSS: ${cliOptions.tailwind ? 'enabled' : 'disabled'}`)
  }

  // If all CLI options are provided, use them directly
  if (cliOptions.template && cliOptions.packageManager !== undefined && cliOptions.tailwind !== undefined) {
    const typescript = cliOptions.template === 'typescript' || cliOptions.template === 'file-router'
    return {
      typescript,
      tailwind: cliOptions.tailwind,
      packageManager: cliOptions.packageManager,
      mode: cliOptions.template === 'file-router' ? FILE_ROUTER : CODE_ROUTER,
    }
  }

  // Router type selection (if not provided via CLI)
  const routerType = cliOptions.template === 'file-router'
    ? FILE_ROUTER
    : cliOptions.template === 'typescript' || cliOptions.template === 'javascript'
    ? CODE_ROUTER
    : await select({
        message: 'Select the router type:',
        options: [
          { value: FILE_ROUTER, label: 'File Router - File-based routing structure' },
          { value: CODE_ROUTER, label: 'Code Router - Traditional code-based routing' },
        ],
        initialValue: FILE_ROUTER,
      }) as typeof CODE_ROUTER | typeof FILE_ROUTER

  // TypeScript selection (if not provided via CLI)
  const typescript = routerType === FILE_ROUTER 
    ? true 
    : cliOptions.template === 'typescript'
    ? true
    : cliOptions.template === 'javascript'
    ? false
    : await confirm({
        message: 'Would you like to use TypeScript?',
        initialValue: false,
      }) as boolean

  // Tailwind selection (if not provided via CLI)
  const tailwind = cliOptions.tailwind ?? await confirm({
    message: 'Would you like to use Tailwind CSS?',
    initialValue: false,
  }) as boolean

  // Package manager selection (if not provided via CLI)
  const detectedPackageManager = getPackageManager()
  const packageManager = cliOptions.packageManager ?? await select({
    message: 'Select package manager:',
    options: SUPPORTED_PACKAGE_MANAGERS.map(pm => ({
      value: pm,
      label: pm,
      hint: pm === detectedPackageManager ? '(detected)' : undefined
    })),
    initialValue: detectedPackageManager
  }) as PackageManager

  return {
    typescript,
    tailwind,
    packageManager,
    mode: routerType
  }
}

program
  .name('create-tsrouter-app')
  .description('CLI to create a new TanStack application')
  .argument('<project-name>', 'name of the project')
  .option<'typescript' | 'javascript' | 'file-router'>(
    '--template <type>',
    'project template (typescript, javascript, file-router)',
    (value) => {
      if (
        value !== 'typescript' &&
        value !== 'javascript' &&
        value !== 'file-router'
      ) {
        throw new InvalidArgumentError(
          `Invalid template: ${value}. Only the following are allowed: typescript, javascript, file-router`,
        )
      }
      return value
    },
  )
  .option<PackageManager>(
    `--package-manager <${SUPPORTED_PACKAGE_MANAGERS.join('|')}>`,
    `Explicitly tell the CLI to use this package manager`,
    (value) => {
      if (!SUPPORTED_PACKAGE_MANAGERS.includes(value as PackageManager)) {
        throw new InvalidArgumentError(
          `Invalid package manager: ${value}. Only the following are allowed: ${SUPPORTED_PACKAGE_MANAGERS.join(
            ', ',
          )}`,
        )
      }
      return value as PackageManager
    },
  )
  .option('--tailwind', 'add Tailwind CSS')
  .action(async (projectName: string, options: CliOptions) => {
    try {
      const finalOptions = await promptForOptions(projectName, options)
      await createApp(projectName, finalOptions)
    } catch (error) {
      log.error(error instanceof Error ? error.message : 'An unknown error occurred')
      process.exit(1)
    }
  })

program.parse()
