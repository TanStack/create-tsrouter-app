import fs from 'node:fs'
import path from 'node:path'

import chokidar from 'chokidar'
import chalk from 'chalk'
import { temporaryDirectory } from 'tempy'
import {
  createApp,
  getFrameworkById,
  registerFramework,
} from '@tanstack/cta-engine'
import { FileSyncer } from './file-syncer.js'
import { createUIEnvironment } from './ui-environment.js'
import type {
  Environment,
  Framework,
  FrameworkDefinition,
  Options,
} from '@tanstack/cta-engine'
import type { FSWatcher } from 'chokidar'

export interface DevWatchOptions {
  watchPath: string
  targetDir: string
  framework: Framework
  cliOptions: Options
  packageManager: string
  environment: Environment
  frameworkDefinitionInitializers?: Array<() => FrameworkDefinition>
}

interface ChangeEvent {
  type: 'add' | 'change' | 'unlink'
  path: string
  relativePath: string
  timestamp: number
}

class DebounceQueue {
  private timer: NodeJS.Timeout | null = null
  private changes: Set<string> = new Set()
  private callback: (changes: Set<string>) => void

  constructor(
    callback: (changes: Set<string>) => void,
    private delay: number = 1000,
  ) {
    this.callback = callback
  }

  add(path: string): void {
    this.changes.add(path)

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      const currentChanges = new Set(this.changes)
      this.callback(currentChanges)
      this.changes.clear()
    }, this.delay)
  }

  size(): number {
    return this.changes.size
  }

  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.changes.clear()
  }
}

export class DevWatchManager {
  private watcher: FSWatcher | null = null
  private debounceQueue: DebounceQueue
  private syncer: FileSyncer
  private tempDir: string | null = null
  private isBuilding = false
  private buildCount = 0

  constructor(private options: DevWatchOptions) {
    this.syncer = new FileSyncer()
    this.debounceQueue = new DebounceQueue((changes) => this.rebuild(changes))
  }

  async start(): Promise<void> {
    // Validate watch path
    if (!fs.existsSync(this.options.watchPath)) {
      throw new Error(`Watch path does not exist: ${this.options.watchPath}`)
    }

    // Validate target directory exists (should have been created by createApp)
    if (!fs.existsSync(this.options.targetDir)) {
      throw new Error(
        `Target directory does not exist: ${this.options.targetDir}`,
      )
    }

    if (this.options.cliOptions.install === false) {
      throw new Error('Cannot use the --no-install flag when using --dev-watch')
    }

    // Log startup with tree style
    console.log()
    console.log(chalk.bold('dev-watch'))
    this.log.tree('', `watching: ${chalk.cyan(this.options.watchPath)}`)
    this.log.tree('', `target: ${chalk.cyan(this.options.targetDir)}`)
    this.log.tree('', 'ready', true)

    // Setup signal handlers
    process.on('SIGINT', () => this.cleanup())
    process.on('SIGTERM', () => this.cleanup())

    // Start watching
    this.startWatcher()
  }

  async stop(): Promise<void> {
    console.log()
    this.log.info('Stopping dev watch mode...')

    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }

    this.debounceQueue.clear()
    this.cleanup()
  }

  private startWatcher(): void {
    const watcherConfig = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.DS_Store',
        '**/*.log',
        this.tempDir!,
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    }

    this.watcher = chokidar.watch(this.options.watchPath, watcherConfig)

    this.watcher.on('add', (filePath) => this.handleChange('add', filePath))
    this.watcher.on('change', (filePath) =>
      this.handleChange('change', filePath),
    )
    this.watcher.on('unlink', (filePath) =>
      this.handleChange('unlink', filePath),
    )
    this.watcher.on('error', (error) =>
      this.log.error(`Watcher error: ${error.message}`),
    )

    this.watcher.on('ready', () => {
      // Already shown in startup, no need to repeat
    })
  }

  private handleChange(_type: ChangeEvent['type'], filePath: string): void {
    const relativePath = path.relative(this.options.watchPath, filePath)
    // Log change only once for the first file in debounce queue
    if (this.debounceQueue.size() === 0) {
      this.log.section('change detected')
      this.log.subsection(`└─ ${relativePath}`)
    } else {
      this.log.subsection(`└─ ${relativePath}`)
    }
    this.debounceQueue.add(filePath)
  }

  private async rebuild(changes: Set<string>): Promise<void> {
    if (this.isBuilding) {
      this.log.warning('Build already in progress, skipping...')
      return
    }

    this.isBuilding = true
    this.buildCount++
    const buildId = this.buildCount

    try {
      this.log.section(`build #${buildId}`)
      const startTime = Date.now()

      if (!this.options.frameworkDefinitionInitializers) {
        throw new Error(
          'There must be framework initalizers passed to frameworkDefinitionInitializers to use --dev-watch',
        )
      }

      const refreshedFrameworks =
        this.options.frameworkDefinitionInitializers.map(
          (frameworkInitalizer) => frameworkInitalizer(),
        )

      const refreshedFramework = refreshedFrameworks.find(
        (f) => f.id === this.options.framework.id,
      )

      if (!refreshedFramework) {
        throw new Error('Could not identify the framework')
      }

      // Update the chosen addons to use the latest code
      const chosenAddonIds = this.options.cliOptions.chosenAddOns.map(
        (m) => m.id,
      )
      const updatedChosenAddons = refreshedFramework.addOns.filter((f) =>
        chosenAddonIds.includes(f.id),
      )

      // Create temp directory for this build using tempy
      this.tempDir = temporaryDirectory()

      // Register the scanned framework
      registerFramework({
        ...refreshedFramework,
        id: `${refreshedFramework.id}-updated`,
      })

      // Get the registered framework
      const registeredFramework = getFrameworkById(
        `${refreshedFramework.id}-updated`,
      )
      if (!registeredFramework) {
        throw new Error(
          `Failed to register framework: ${this.options.framework.id}`,
        )
      }

      // Check if package.json was modified
      const packageJsonModified = Array.from(changes).some(
        (filePath) => path.basename(filePath) === 'package.json',
      )

      const updatedOptions: Options = {
        ...this.options.cliOptions,
        chosenAddOns: updatedChosenAddons,
        framework: registeredFramework,
        targetDir: this.tempDir,
        git: false,
        install: packageJsonModified,
      }

      // Show package installation indicator if needed
      if (packageJsonModified) {
        this.log.tree('  ', `${chalk.yellow('⟳')} installing packages...`)
      }

      // Create app in temp directory with silent environment
      const silentEnvironment = createUIEnvironment(
        this.options.environment.appName,
        true,
      )
      await createApp(silentEnvironment, updatedOptions)

      // Sync files to target directory
      const syncResult = await this.syncer.sync(
        this.tempDir,
        this.options.targetDir,
      )

      // Clean up temp directory after sync is complete
      try {
        await fs.promises.rm(this.tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        this.log.warning(
          `Failed to clean up temp directory: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        )
      }

      const elapsed = Date.now() - startTime

      // Build tree-style summary
      this.log.tree('  ', `duration: ${chalk.cyan(elapsed + 'ms')}`)

      if (packageJsonModified) {
        this.log.tree('  ', `packages: ${chalk.green('✓ installed')}`)
      }

      // Always show the last item in tree without checking for files to show
      const noMoreTreeItems =
        syncResult.updated.length === 0 &&
        syncResult.created.length === 0 &&
        syncResult.errors.length === 0

      if (syncResult.updated.length > 0) {
        this.log.tree(
          '  ',
          `updated: ${chalk.green(syncResult.updated.length + ' file' + (syncResult.updated.length > 1 ? 's' : ''))}`,
          syncResult.created.length === 0 && syncResult.errors.length === 0,
        )
      }
      if (syncResult.created.length > 0) {
        this.log.tree(
          '  ',
          `created: ${chalk.green(syncResult.created.length + ' file' + (syncResult.created.length > 1 ? 's' : ''))}`,
          syncResult.errors.length === 0,
        )
      }
      if (syncResult.errors.length > 0) {
        this.log.tree(
          '  ',
          `failed: ${chalk.red(syncResult.errors.length + ' file' + (syncResult.errors.length > 1 ? 's' : ''))}`,
          true,
        )
      }

      // If nothing changed, show that
      if (noMoreTreeItems) {
        this.log.tree('  ', `no changes`, true)
      }

      // Always show changed files with diffs
      if (syncResult.updated.length > 0) {
        syncResult.updated.forEach((update, index) => {
          const isLastFile =
            index === syncResult.updated.length - 1 &&
            syncResult.created.length === 0

          // For files with diffs, always use ├─
          const fileIsLast = isLastFile && !update.diff
          this.log.treeItem('  ', update.path, fileIsLast)

          // Always show diff if available
          if (update.diff) {
            const diffLines = update.diff.split('\n')
            const relevantLines = diffLines
              .slice(4)
              .filter(
                (line) =>
                  line.startsWith('+') ||
                  line.startsWith('-') ||
                  line.startsWith('@'),
              )

            if (relevantLines.length > 0) {
              // Always use │ to continue the tree line through the diff
              const prefix = '    │ '
              relevantLines.forEach((line) => {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  console.log(chalk.gray(prefix) + '  ' + chalk.green(line))
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  console.log(chalk.gray(prefix) + '  ' + chalk.red(line))
                } else if (line.startsWith('@')) {
                  console.log(chalk.gray(prefix) + '  ' + chalk.cyan(line))
                }
              })
            }
          }
        })
      }
      
      // Show created files
      if (syncResult.created.length > 0) {
        syncResult.created.forEach((file, index) => {
          const isLast = index === syncResult.created.length - 1
          this.log.treeItem('  ', `${chalk.green('+')} ${file}`, isLast)
        })
      }

      // Always show errors
      if (syncResult.errors.length > 0) {
        console.log() // Add spacing
        syncResult.errors.forEach((err, index) => {
          this.log.tree(
            '  ',
            `${chalk.red('error:')} ${err}`,
            index === syncResult.errors.length - 1,
          )
        })
      }
    } catch (error) {
      this.log.error(
        `Build #${buildId} failed: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      this.isBuilding = false
    }
  }

  private cleanup(): void {
    console.log()
    console.log('Cleaning up...')

    // Clean up temp directory
    if (this.tempDir && fs.existsSync(this.tempDir)) {
      try {
        fs.rmSync(this.tempDir, { recursive: true, force: true })
      } catch (error) {
        this.log.error(
          `Failed to clean up temp directory: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    process.exit(0)
  }

  private log = {
    tree: (prefix: string, msg: string, isLast = false) => {
      const connector = isLast ? '└─' : '├─'
      console.log(chalk.gray(prefix + connector) + ' ' + msg)
    },
    treeItem: (prefix: string, msg: string, isLast = false) => {
      const connector = isLast ? '└─' : '├─'
      console.log(chalk.gray(prefix + '  ' + connector) + ' ' + msg)
    },
    info: (msg: string) => console.log(msg),
    error: (msg: string) => console.error(chalk.red('✗') + ' ' + msg),
    success: (msg: string) => console.log(chalk.green('✓') + ' ' + msg),
    warning: (msg: string) => console.log(chalk.yellow('⚠') + ' ' + msg),
    section: (title: string) => console.log('\n' + chalk.bold('▸ ' + title)),
    subsection: (msg: string) => console.log('  ' + msg),
  }
}
