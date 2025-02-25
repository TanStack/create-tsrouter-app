#!/usr/bin/env node

import {
  appendFile,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { log, outro, spinner } from '@clack/prompts'
import { execa } from 'execa'
import { render } from 'ejs'
import { format } from 'prettier'
import chalk from 'chalk'

import { CODE_ROUTER, FILE_ROUTER } from './constants.js'

import type { Options } from './types.js'

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

function createCopyFiles(targetDir: string) {
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

function jsSafeName(name: string) {
  return name
    .split(/[^a-zA-Z0-9]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
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
    extraTemplateValues?: Record<string, any>,
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
      addOnEnabled: options.chosenAddOns.reduce<Record<string, boolean>>(
        (acc, addOn) => {
          acc[addOn.id] = true
          return acc
        },
        {},
      ),
      addOns: options.chosenAddOns,
      ...extraTemplateValues,
    }

    const template = await readFile(resolve(templateDir, file), 'utf-8')
    let content = ''
    try {
      content = render(template, templateValues)
    } catch (error) {
      console.error(chalk.red(`EJS error in file ${file}`))
      console.error(error)
      process.exit(1)
    }
    const target = targetFileName ?? file.replace('.ejs', '')

    if (target.endsWith('.ts') || target.endsWith('.tsx')) {
      content = await format(content, {
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        parser: 'typescript',
      })
    }

    await mkdir(dirname(resolve(targetDir, target)), {
      recursive: true,
    })

    await writeFile(resolve(targetDir, target), content)
  }
}

async function createPackageJSON(
  projectName: string,
  options: Required<Options>,
  templateDir: string,
  routerDir: string,
  targetDir: string,
  addOns: Array<{
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    scripts?: Record<string, string>
  }>,
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

  for (const addOn of addOns) {
    packageJSON = {
      ...packageJSON,
      dependencies: {
        ...packageJSON.dependencies,
        ...addOn.dependencies,
      },
      devDependencies: {
        ...packageJSON.devDependencies,
        ...addOn.devDependencies,
      },
      scripts: {
        ...packageJSON.scripts,
        ...addOn.scripts,
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

async function copyFilesRecursively(
  source: string,
  target: string,
  copyFile: (source: string, target: string) => Promise<void>,
  templateFile: (file: string, targetFileName?: string) => Promise<void>,
) {
  const sourceStat = statSync(source)
  if (sourceStat.isDirectory()) {
    const files = readdirSync(source)
    for (const file of files) {
      const sourceChild = resolve(source, file)
      const targetChild = resolve(target, file)
      await copyFilesRecursively(
        sourceChild,
        targetChild,
        copyFile,
        templateFile,
      )
    }
  } else {
    let targetFile = basename(target).replace(/_dot_/, '.')
    let isTemplate = false
    if (targetFile.endsWith('.ejs')) {
      targetFile = targetFile.replace('.ejs', '')
      isTemplate = true
    }
    let isAppend = false
    if (targetFile.endsWith('.append')) {
      targetFile = targetFile.replace('.append', '')
      isAppend = true
    }

    const targetPath = resolve(dirname(target), targetFile)

    await mkdir(dirname(targetPath), {
      recursive: true,
    })

    if (isTemplate) {
      await templateFile(source, targetPath)
    } else {
      if (isAppend) {
        await appendFile(targetPath, (await readFile(source)).toString())
      } else {
        await copyFile(source, targetPath)
      }
    }
  }
}

export async function createApp(
  options: Required<Options>,
  {
    silent = false,
  }: {
    silent?: boolean
  } = {},
) {
  const templateDirBase = fileURLToPath(
    new URL(`../templates/${options.framework}/base`, import.meta.url),
  )
  const templateDirRouter = fileURLToPath(
    new URL(
      `../templates/${options.framework}/${options.mode}`,
      import.meta.url,
    ),
  )
  const targetDir = resolve(process.cwd(), options.projectName)

  if (existsSync(targetDir)) {
    if (!silent) {
      log.error(`Directory "${options.projectName}" already exists`)
    }
    return
  }

  const copyFiles = createCopyFiles(targetDir)
  const templateFile = createTemplateFile(
    options.projectName,
    options,
    targetDir,
  )

  const isAddOnEnabled = (id: string) =>
    options.chosenAddOns.find((a) => a.id === id)

  // Make the root directory
  await mkdir(targetDir, { recursive: true })

  // Setup the .vscode directory
  await mkdir(resolve(targetDir, '.vscode'), { recursive: true })
  await copyFile(
    resolve(templateDirBase, '_dot_vscode/settings.json'),
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
    await mkdir(resolve(targetDir, 'src/components'), { recursive: true })
  }

  // Check for a .cursorrules file
  if (existsSync(resolve(templateDirBase, '.cursorrules'))) {
    await copyFile(
      resolve(templateDirBase, '.cursorrules'),
      resolve(targetDir, '.cursorrules'),
    )
  }

  // Copy in Vite and Tailwind config and CSS
  if (!options.tailwind) {
    await copyFiles(templateDirBase, ['./src/App.css'])
  }
  await templateFile(templateDirBase, './vite.config.js.ejs')
  await templateFile(templateDirBase, './src/styles.css.ejs')

  copyFiles(templateDirBase, ['./src/logo.svg'])

  // Setup the main, reportWebVitals and index.html files
  if (!isAddOnEnabled('start') && options.framework === 'react') {
    if (options.typescript) {
      await templateFile(templateDirBase, './src/reportWebVitals.ts.ejs')
    } else {
      await templateFile(
        templateDirBase,
        './src/reportWebVitals.ts.ejs',
        './src/reportWebVitals.js',
      )
    }
  }
  if (!isAddOnEnabled('start')) {
    await templateFile(templateDirBase, './index.html.ejs')
  }

  // Setup tsconfig
  if (options.typescript) {
    await templateFile(
      templateDirBase,
      './tsconfig.json.ejs',
      './tsconfig.json',
    )
  }

  // Setup the package.json file, optionally with typescript and tailwind
  await createPackageJSON(
    options.projectName,
    options,
    templateDirBase,
    templateDirRouter,
    targetDir,
    options.chosenAddOns.map((addOn) => addOn.packageAdditions),
  )

  // Copy all the asset files from the addons
  const s = silent ? null : spinner()
  for (const phase of ['setup', 'add-on', 'example']) {
    for (const addOn of options.chosenAddOns.filter(
      (addOn) => addOn.phase === phase,
    )) {
      s?.start(`Setting up ${addOn.name}...`)
      const addOnDir = resolve(addOn.directory, 'assets')
      if (existsSync(addOnDir)) {
        await copyFilesRecursively(
          addOnDir,
          targetDir,
          copyFile,
          async (file: string, targetFileName?: string) =>
            templateFile(addOnDir, file, targetFileName),
        )
      }

      if (addOn.command) {
        await execa(addOn.command.command, addOn.command.args || [], {
          cwd: targetDir,
        })
      }
      s?.stop(`${addOn.name} setup complete`)
    }
  }

  if (isAddOnEnabled('shadcn')) {
    const shadcnComponents = new Set<string>()
    for (const addOn of options.chosenAddOns) {
      if (addOn.shadcnComponents) {
        for (const component of addOn.shadcnComponents) {
          shadcnComponents.add(component)
        }
      }
    }

    if (shadcnComponents.size > 0) {
      s?.start(
        `Installing shadcn components (${Array.from(shadcnComponents).join(', ')})...`,
      )
      await execa('npx', ['shadcn@canary', 'add', ...shadcnComponents], {
        cwd: targetDir,
      })
      s?.stop(`Installed shadcn components`)
    }
  }

  const integrations: Array<{
    type: 'layout' | 'provider' | 'header-user'
    name: string
    path: string
  }> = []
  if (existsSync(resolve(targetDir, 'src/integrations'))) {
    for (const integration of readdirSync(
      resolve(targetDir, 'src/integrations'),
    )) {
      const integrationName = jsSafeName(integration)
      if (
        existsSync(
          resolve(targetDir, 'src/integrations', integration, 'layout.tsx'),
        )
      ) {
        integrations.push({
          type: 'layout',
          name: `${integrationName}Layout`,
          path: `integrations/${integration}/layout`,
        })
      }
      if (
        existsSync(
          resolve(targetDir, 'src/integrations', integration, 'provider.tsx'),
        )
      ) {
        integrations.push({
          type: 'provider',
          name: `${integrationName}Provider`,
          path: `integrations/${integration}/provider`,
        })
      }
      if (
        existsSync(
          resolve(
            targetDir,
            'src/integrations',
            integration,
            'header-user.tsx',
          ),
        )
      ) {
        integrations.push({
          type: 'header-user',
          name: `${integrationName}Header`,
          path: `integrations/${integration}/header-user`,
        })
      }
    }
  }

  const routes: Array<{
    path: string
    name: string
  }> = []
  if (existsSync(resolve(targetDir, 'src/routes'))) {
    for (const file of readdirSync(resolve(targetDir, 'src/routes'))) {
      const name = file.replace(/\.tsx?|\.jsx?/, '')
      const safeRouteName = jsSafeName(name)
      routes.push({
        path: `./routes/${name}`,
        name: safeRouteName,
      })
    }
  }

  // Create the main entry point
  if (!isAddOnEnabled('start')) {
    if (options.typescript) {
      await templateFile(
        templateDirRouter,
        './src/main.tsx.ejs',
        './src/main.tsx',
        {
          routes,
          integrations,
        },
      )
    } else {
      await templateFile(
        templateDirRouter,
        './src/main.tsx.ejs',
        './src/main.jsx',
        {
          routes,
          integrations,
        },
      )
    }
  }

  // Setup the app component. There are four variations, typescript/javascript and tailwind/non-tailwind.
  if (options.mode === FILE_ROUTER) {
    await templateFile(
      templateDirRouter,
      './src/routes/__root.tsx.ejs',
      './src/routes/__root.tsx',
      {
        integrations,
      },
    )
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
    if (options.framework === 'react') {
      await templateFile(
        templateDirBase,
        './src/App.test.tsx.ejs',
        options.typescript ? undefined : './src/App.test.jsx',
      )
    }
  }

  if (routes.length > 0) {
    await templateFile(
      templateDirBase,
      './src/components/Header.tsx.ejs',
      './src/components/Header.tsx',
      {
        integrations,
      },
    )
  }

  const warnings: Array<string> = []
  for (const addOn of options.chosenAddOns) {
    if (addOn.warning) {
      warnings.push(addOn.warning)
    }
  }

  // Add .gitignore
  await copyFile(
    resolve(templateDirBase, '_dot_gitignore'),
    resolve(targetDir, '.gitignore'),
  )

  // Create the README.md
  await templateFile(templateDirBase, 'README.md.ejs')

  // Install dependencies
  s?.start(`Installing dependencies via ${options.packageManager}...`)
  await execa(options.packageManager, ['install'], { cwd: targetDir })
  s?.stop(`Installed dependencies`)

  if (warnings.length > 0) {
    if (!silent) {
      log.warn(chalk.red(warnings.join('\n')))
    }
  }

  if (options.git) {
    s?.start(`Initializing git repository...`)
    await execa('git', ['init'], { cwd: targetDir })
    s?.stop(`Initialized git repository`)
  }

  if (!silent) {
    outro(`Created your new TanStack app in '${basename(targetDir)}'.

Use the following commands to start your app:
% cd ${options.projectName}
% ${options.packageManager === 'deno' ? 'deno start' : options.packageManager} ${isAddOnEnabled('start') ? 'dev' : 'start'}

Please read README.md for more information on testing, styling, adding routes, react-query, etc.
`)
  }
}
