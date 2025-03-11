import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { log, outro, spinner } from '@clack/prompts'
import { render } from 'ejs'
import { format } from 'prettier'
import chalk from 'chalk'

import { CODE_ROUTER, FILE_ROUTER } from './constants.js'

import type { Environment } from './environment.js'
import type { Options } from './types.js'

function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

function createCopyFiles(environment: Environment, targetDir: string) {
  return async function copyFiles(
    templateDir: string,
    files: Array<string>,
    // optionally copy files from a folder to the root
    toRoot?: boolean,
  ) {
    for (const file of files) {
      let targetFileName = file.replace('.tw', '')
      if (toRoot) {
        const fileNoPath = targetFileName.split('/').pop()
        targetFileName = fileNoPath ? `./${fileNoPath}` : targetFileName
      }
      await environment.copyFile(
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
  environment: Environment,
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
    function getPackageManagerAddScript(
      packageName: string,
      isDev: boolean = false,
    ) {
      let command
      switch (options.packageManager) {
        case 'yarn':
        case 'pnpm':
          command = isDev
            ? `${options.packageManager} add ${packageName} --dev`
            : `${options.packageManager} add ${packageName}`
          break
        default:
          command = isDev
            ? `${options.packageManager} install ${packageName} -D`
            : `${options.packageManager} install ${packageName}`
          break
      }
      return command
    }

    function getPackageManagerRunScript(scriptName: string) {
      let command
      switch (options.packageManager) {
        case 'yarn':
        case 'pnpm':
          command = `${options.packageManager} ${scriptName}`
          break
        case 'deno':
          command = `${options.packageManager} task ${scriptName}`
          break
        default:
          command = `${options.packageManager} run ${scriptName}`
          break
      }
      return command
    }

    const templateValues = {
      packageManager: options.packageManager,
      projectName: projectName,
      typescript: options.typescript,
      tailwind: options.tailwind,
      toolchain: options.toolchain,
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

      getPackageManagerAddScript,
      getPackageManagerRunScript,
    }

    const template = await environment.readFile(
      resolve(templateDir, file),
      'utf-8',
    )
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

    await environment.writeFile(resolve(targetDir, target), content)
  }
}

async function createPackageJSON(
  environment: Environment,
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
    await environment.readFile(resolve(templateDir, 'package.json'), 'utf8'),
  )
  packageJSON.name = projectName
  if (options.typescript) {
    const tsPackageJSON = JSON.parse(
      await environment.readFile(
        resolve(templateDir, 'package.ts.json'),
        'utf8',
      ),
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
      await environment.readFile(
        resolve(templateDir, 'package.tw.json'),
        'utf8',
      ),
    )
    packageJSON = {
      ...packageJSON,
      dependencies: {
        ...packageJSON.dependencies,
        ...twPackageJSON.dependencies,
      },
    }
  }
  if (options.toolchain === 'biome') {
    const biomePackageJSON = JSON.parse(
      await environment.readFile(
        resolve(templateDir, 'package.biome.json'),
        'utf8',
      ),
    )
    packageJSON = {
      ...packageJSON,
      scripts: {
        ...packageJSON.scripts,
        ...biomePackageJSON.scripts,
      },
      devDependencies: {
        ...packageJSON.devDependencies,
        ...biomePackageJSON.devDependencies,
      },
    }
  }
  if (options.mode === FILE_ROUTER) {
    const frPackageJSON = JSON.parse(
      await environment.readFile(resolve(routerDir, 'package.fr.json'), 'utf8'),
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

  await environment.writeFile(
    resolve(targetDir, 'package.json'),
    JSON.stringify(packageJSON, null, 2),
  )
}

async function copyFilesRecursively(
  environment: Environment,
  source: string,
  target: string,
  templateFile: (file: string, targetFileName?: string) => Promise<void>,
) {
  if (environment.isDirectory(source)) {
    const files = environment.readdir(source)
    for (const file of files) {
      const sourceChild = resolve(source, file)
      const targetChild = resolve(target, file)
      await copyFilesRecursively(
        environment,
        sourceChild,
        targetChild,
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

    if (isTemplate) {
      await templateFile(source, targetPath)
    } else {
      if (isAppend) {
        await environment.appendFile(
          targetPath,
          (await environment.readFile(source)).toString(),
        )
      } else {
        await environment.copyFile(source, targetPath)
      }
    }
  }
}

export async function createApp(
  options: Required<Options>,
  {
    silent = false,
    environment,
  }: {
    silent?: boolean
    environment: Environment
  },
) {
  environment.startRun()

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

  if (environment.exists(targetDir)) {
    if (!silent) {
      log.error(`Directory "${options.projectName}" already exists`)
    }
    return
  }

  const copyFiles = createCopyFiles(environment, targetDir)
  const templateFile = createTemplateFile(
    environment,
    options.projectName,
    options,
    targetDir,
  )

  const isAddOnEnabled = (id: string) =>
    options.chosenAddOns.find((a) => a.id === id)

  // Setup the .vscode directory
  switch (options.toolchain) {
    case 'biome':
      await environment.copyFile(
        resolve(templateDirBase, '_dot_vscode/settings.biome.json'),
        resolve(targetDir, '.vscode/settings.json'),
      )
      break
    case 'none':
    default:
      await environment.copyFile(
        resolve(templateDirBase, '_dot_vscode/settings.json'),
        resolve(targetDir, '.vscode/settings.json'),
      )
  }

  // Fill the public directory
  copyFiles(templateDirBase, [
    './public/robots.txt',
    './public/favicon.ico',
    './public/manifest.json',
    './public/logo192.png',
    './public/logo512.png',
  ])

  // Check for a .cursorrules file
  if (environment.exists(resolve(templateDirBase, '.cursorrules'))) {
    await environment.copyFile(
      resolve(templateDirBase, '.cursorrules'),
      resolve(targetDir, '.cursorrules'),
    )
  }

  // Copy in Vite and Tailwind config and CSS
  if (!options.tailwind) {
    await copyFiles(templateDirBase, ['./src/App.css'])
  }

  // Don't create a vite.config.js file if we are building a Start app
  if (!isAddOnEnabled('start')) {
    await templateFile(templateDirBase, './vite.config.js.ejs')
  }

  await templateFile(templateDirBase, './src/styles.css.ejs')

  copyFiles(templateDirBase, ['./src/logo.svg'])

  if (options.toolchain === 'biome') {
    copyFiles(templateDirBase, ['./toolchain/biome.json'], true)
  }

  // Setup reportWebVitals
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

  // Setup the package.json file, optionally with typescript, tailwind and biome
  await createPackageJSON(
    environment,
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
      if (environment.exists(addOnDir)) {
        await copyFilesRecursively(
          environment,
          addOnDir,
          targetDir,
          async (file: string, targetFileName?: string) =>
            templateFile(addOnDir, file, targetFileName),
        )
      }

      if (addOn.command) {
        await environment.execute(
          addOn.command.command,
          addOn.command.args || [],
          targetDir,
        )
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
      await environment.execute(
        'npx',
        ['shadcn@canary', 'add', ...shadcnComponents],
        targetDir,
      )
      s?.stop(`Installed shadcn components`)
    }
  }

  const integrations: Array<{
    type: 'layout' | 'provider' | 'root-provider' | 'header-user'
    name: string
    path: string
  }> = []
  if (environment.exists(resolve(targetDir, 'src/integrations'))) {
    for (const integration of environment.readdir(
      resolve(targetDir, 'src/integrations'),
    )) {
      const integrationName = jsSafeName(integration)
      if (
        environment.exists(
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
        environment.exists(
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
        environment.exists(
          resolve(
            targetDir,
            'src/integrations',
            integration,
            'root-provider.tsx',
          ),
        )
      ) {
        integrations.push({
          type: 'root-provider',
          name: integrationName,
          path: `integrations/${integration}/root-provider`,
        })
      }
      if (
        environment.exists(
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
  if (environment.exists(resolve(targetDir, 'src/routes'))) {
    for (const file of environment.readdir(resolve(targetDir, 'src/routes'))) {
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

  if (
    routes.length > 0 ||
    options.chosenAddOns.length > 0 ||
    integrations.length > 0
  ) {
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
  await environment.copyFile(
    resolve(templateDirBase, '_dot_gitignore'),
    resolve(targetDir, '.gitignore'),
  )

  // Append addon-specific .gitignore entries
  for (const addOn of options.chosenAddOns) {
    if (
      environment.exists(
        resolve(addOn.directory, 'assets', '_dot_gitignore.append'),
      )
    ) {
      await environment.appendFile(
        resolve(targetDir, '.gitignore'),
        (
          await environment.readFile(
            resolve(addOn.directory, 'assets', '_dot_gitignore.append'),
          )
        ).toString(),
      )
    }
  }

  // Create the README.md
  await templateFile(templateDirBase, 'README.md.ejs')

  // Install dependencies
  s?.start(`Installing dependencies via ${options.packageManager}...`)
  await environment.execute(options.packageManager, ['install'], targetDir)
  s?.stop(`Installed dependencies`)

  if (warnings.length > 0) {
    if (!silent) {
      log.warn(chalk.red(warnings.join('\n')))
    }
  }

  if (options.toolchain === 'biome') {
    s?.start(`Applying toolchain ${options.toolchain}...`)
    switch (options.packageManager) {
      case 'pnpm':
        // pnpm automatically forwards extra arguments
        await environment.execute(
          options.packageManager,
          ['run', 'check', '--fix'],
          targetDir,
        )
        break
      default:
        await environment.execute(
          options.packageManager,
          ['run', 'check', '--', '--fix'],
          targetDir,
        )
        break
    }
    s?.stop(`Applied toolchain ${options.toolchain}...`)
  }

  if (options.git) {
    s?.start(`Initializing git repository...`)
    await environment.execute('git', ['init'], targetDir)
    s?.stop(`Initialized git repository`)
  }

  environment.finishRun()

  let errorStatement = ''
  if (environment.getErrors().length) {
    errorStatement = `

${chalk.red('There were errors encountered during this process:')}

${environment.getErrors().join('\n')}`
  }

  if (!silent) {
    let startCommand = `${options.packageManager} ${isAddOnEnabled('start') ? 'dev' : 'start'}`
    if (options.packageManager === 'deno') {
      startCommand = `deno ${isAddOnEnabled('start') ? 'task dev' : 'start'}`
    }

    outro(`Created your TanStack app in '${basename(targetDir)}'.

Use the following commands to start your app:
% cd ${options.projectName}
% ${startCommand}

Please read README.md for more information on testing, styling, adding routes, react-query, etc.${errorStatement}`)
  }
}
