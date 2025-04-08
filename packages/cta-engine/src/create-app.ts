import { basename, dirname, resolve } from 'node:path'
import { log, outro, spinner } from '@clack/prompts'
import { render } from 'ejs'
import { format } from 'prettier'
import chalk from 'chalk'

import { getTemplatesRoot } from './templates.js'
import { CODE_ROUTER, FILE_ROUTER } from './constants.js'
import { sortObject } from './utils.js'
import { writeConfigFile } from './config-file.js'
import { packageManagerExecute } from './package-manager.js'
import { getBinaryFile } from './file-helper.js'

import type { AddOn, Environment, Options } from './types.js'

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
  options: Options,
  targetDir: string,
) {
  return async function templateFile(
    file: string,
    content: string,
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

    try {
      content = render(content, templateValues)
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
  options: Options,
  templateDir: string,
  routerDir: string,
  targetDir: string,
  addOns: Array<AddOn['packageAdditions']>,
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
  if (options.toolchain === 'eslint+prettier') {
    const eslintPrettierPackageJSON = JSON.parse(
      await environment.readFile(
        resolve(templateDir, 'package.eslintprettier.json'),
        'utf-8',
      ),
    )
    packageJSON = {
      ...packageJSON,
      scripts: {
        ...packageJSON.scripts,
        ...eslintPrettierPackageJSON.scripts,
      },
      devDependencies: {
        ...packageJSON.devDependencies,
        ...eslintPrettierPackageJSON.devDependencies,
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
    const { dependencies, devDependencies, scripts, pnpm, ...rest } = addOn
    packageJSON = {
      ...packageJSON,
      dependencies: {
        ...packageJSON.dependencies,
        ...dependencies,
      },
      devDependencies: {
        ...packageJSON.devDependencies,
        ...devDependencies,
      },
      scripts: {
        ...packageJSON.scripts,
        ...scripts,
      },
      ...rest,
    }
    if (options.packageManager === 'pnpm') {
      packageJSON.pnpm = {
        ...(packageJSON?.pnpm ?? {}),
        ...pnpm,
      }
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

async function copyAddOnFile(
  environment: Environment,
  content: string,
  target: string,
  targetPath: string,
  templateFile: (content: string, targetFileName: string) => Promise<void>,
) {
  let targetFile = basename(target).replace(/^_dot_/, '.')
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

  const finalTargetPath = resolve(dirname(targetPath), targetFile)

  const binaryContent = getBinaryFile(content)
  if (binaryContent) {
    await environment.writeFile(
      finalTargetPath,
      binaryContent as unknown as string,
    )
    return
  }

  if (isTemplate) {
    await templateFile(content, finalTargetPath)
  } else {
    if (isAppend) {
      await environment.appendFile(finalTargetPath, content)
    } else {
      await environment.writeFile(finalTargetPath, content)
    }
  }
}

export async function createApp(
  options: Options,
  {
    silent = false,
    environment,
    cwd,
    appName = 'TanStack',
  }: {
    silent?: boolean
    environment: Environment
    cwd?: string
    name?: string
    appName?: string
  },
) {
  environment.startRun()

  const templateDirBase = resolve(getTemplatesRoot(), options.framework, 'base')
  const templateDirRouter = resolve(
    getTemplatesRoot(),
    options.framework,
    options.mode,
  )

  let targetDir: string = cwd || ''
  if (!targetDir.length) {
    targetDir = resolve(process.cwd(), options.projectName)

    if (environment.exists(targetDir)) {
      if (!silent) {
        log.error(`Directory "${options.projectName}" already exists`)
      }
      return
    }
  }

  const copyFiles = createCopyFiles(environment, targetDir)
  const templateFileFromContent = createTemplateFile(
    environment,
    options.projectName,
    options,
    targetDir,
  )

  async function templateFile(
    templateBase: string,
    file: string,
    targetFileName?: string,
    extraTemplateValues?: Record<string, any>,
  ) {
    const content = await environment.readFile(
      resolve(templateBase, file),
      'utf-8',
    )
    return templateFileFromContent(
      file,
      content.toString(),
      targetFileName,
      extraTemplateValues,
    )
  }

  const isAddOnEnabled = (id: string) =>
    options.chosenAddOns.find((a) => a.id === id)

  async function runAddOn(addOn: AddOn) {
    if (addOn.files) {
      for (const file of Object.keys(addOn.files)) {
        await copyAddOnFile(
          environment,
          addOn.files[file],
          file,
          resolve(targetDir, file),
          (content, targetFileName) =>
            templateFileFromContent(targetFileName, content),
        )
      }
    }
    if (addOn.deletedFiles) {
      for (const file of addOn.deletedFiles) {
        await environment.deleteFile(resolve(targetDir, file))
      }
    }

    if (addOn.command && addOn.command.command) {
      await environment.execute(
        addOn.command.command,
        addOn.command.args || [],
        resolve(targetDir),
      )
    }
  }

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

  if (options.toolchain === 'eslint+prettier') {
    copyFiles(
      templateDirBase,
      [
        './toolchain/eslint.config.js',
        './toolchain/prettier.config.js',
        './toolchain/.prettierignore',
      ],
      true,
    )
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

  // Add .gitignore
  await environment.copyFile(
    resolve(templateDirBase, '_dot_gitignore'),
    resolve(targetDir, '.gitignore'),
  )

  // Setup tsconfig
  if (options.typescript) {
    await templateFile(
      templateDirBase,
      './tsconfig.json.ejs',
      './tsconfig.json',
    )
  }

  // Setup the package.json file, optionally with typescript, tailwind and formatter/linter
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
  for (const type of ['add-on', 'example']) {
    for (const phase of ['setup', 'add-on', 'example']) {
      for (const addOn of options.chosenAddOns.filter(
        (addOn) => addOn.phase === phase && addOn.type === type,
      )) {
        s?.start(`Setting up ${addOn.name}...`)
        await runAddOn(addOn)
        s?.stop(`${addOn.name} setup complete`)
      }
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
    if (options.overlay) {
      if (options.overlay.shadcnComponents) {
        for (const component of options.overlay.shadcnComponents) {
          shadcnComponents.add(component)
        }
      }
    }

    if (shadcnComponents.size > 0) {
      s?.start(
        `Installing shadcn components (${Array.from(shadcnComponents).join(', ')})...`,
      )
      await packageManagerExecute(
        environment,
        options.packageManager,
        'shadcn@latest',
        ['add', '--silent', '--yes', ...shadcnComponents],
        resolve(targetDir),
      )
      s?.stop(`Installed additional shadcn components`)
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

  // Create the README.md
  await templateFile(templateDirBase, 'README.md.ejs')

  // Adding overlay
  if (options.overlay) {
    s?.start(`Setting up overlay ${options.overlay.name}...`)
    await runAddOn(options.overlay)
    s?.stop(`Overlay ${options.overlay.name} setup complete`)
  }

  // Install dependencies
  s?.start(`Installing dependencies via ${options.packageManager}...`)
  await environment.execute(
    options.packageManager,
    ['install'],
    resolve(targetDir),
  )
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
          resolve(targetDir),
        )
        break
      default:
        await environment.execute(
          options.packageManager,
          ['run', 'check', '--', '--fix'],
          resolve(targetDir),
        )
        break
    }
    s?.stop(`Applied toolchain ${options.toolchain}...`)
  }

  if (options.toolchain === 'eslint+prettier') {
    s?.start(`Applying toolchain ${options.toolchain}...`)
    await environment.execute(
      options.packageManager,
      ['run', 'check'],
      targetDir,
    )
    s?.stop(`Applied toolchain ${options.toolchain}...`)
  }

  if (options.git) {
    s?.start(`Initializing git repository...`)
    await environment.execute('git', ['init'], resolve(targetDir))
    s?.stop(`Initialized git repository`)
  }

  await writeConfigFile(environment, targetDir, options)

  environment.finishRun()

  let errorStatement = ''
  if (environment.getErrors().length) {
    errorStatement = `

${chalk.red('Errors were encountered during this process:')}

${environment.getErrors().join('\n')}`
  }

  if (!silent) {
    let startCommand = `${options.packageManager} ${isAddOnEnabled('start') ? 'dev' : 'start'}`
    if (options.packageManager === 'deno') {
      startCommand = `deno ${isAddOnEnabled('start') ? 'task dev' : 'start'}`
    }

    outro(`Your ${appName} app is ready in '${basename(targetDir)}'.

Use the following commands to start your app:
% cd ${options.projectName}
% ${startCommand}

Please check the README.md for more information on testing, styling, adding routes, react-query, etc.${errorStatement}`)
  }
}
