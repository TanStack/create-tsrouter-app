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

    // Log startup
    this.log.info(`Starting dev watch mode`)
    this.log.info(`Watching: ${chalk.cyan(this.options.watchPath)}`)
    this.log.info(`Target: ${chalk.cyan(this.options.targetDir)}`)
    this.log.info(`Waiting for file changes...`)

    // Setup signal handlers
    process.on('SIGINT', () => this.cleanup())
    process.on('SIGTERM', () => this.cleanup())

    // Start watching
    this.startWatcher()
  }

  async stop(): Promise<void> {
    this.log.info('Stopping dev watch mode')

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

    this.log.success('File watcher started')
  }

  private handleChange(_type: ChangeEvent['type'], filePath: string): void {
    const relativePath = path.relative(this.options.watchPath, filePath)
    this.log.change(relativePath)
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
      this.log.build(`Starting build #${buildId}`)
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

      // Create app in temp directory
      await createApp(this.options.environment, updatedOptions)

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
      this.log.success(`Build #${buildId} completed in ${elapsed}ms`)

      // Report sync results
      if (syncResult.updated.length > 0) {
        this.log.sync(`Updated ${syncResult.updated.length} files`)
        syncResult.updated.forEach((update) => {
          this.log.sync(`  ↳ ${update.path}`)

          // Show diff if available
          if (update.diff) {
            const diffLines = update.diff.split('\n')
            // Skip the header lines and show the actual diff
            const relevantLines = diffLines
              .slice(4)
              .filter(
                (line) =>
                  line.startsWith('+') ||
                  line.startsWith('-') ||
                  line.startsWith('@'),
              )

            if (relevantLines.length > 0) {
              this.log.sync(`     ${chalk.dim('Changes:')}`)
              relevantLines.forEach((line) => {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  this.log.sync(`     ${chalk.green(line)}`)
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  this.log.sync(`     ${chalk.red(line)}`)
                } else if (line.startsWith('@')) {
                  this.log.sync(`     ${chalk.cyan(line)}`)
                }
              })
            }
          }
        })
      }
      if (syncResult.created.length > 0) {
        this.log.sync(`Created ${syncResult.created.length} files`)
        syncResult.created.forEach((file) => this.log.sync(`  ↳ ${file}`))
      }
      if (syncResult.skipped.length > 0) {
        this.log.sync(`Skipped ${syncResult.skipped.length} unchanged files`)
      }
      if (syncResult.errors.length > 0) {
        this.log.error(`Failed to sync ${syncResult.errors.length} files`)
        syncResult.errors.forEach((err) => this.log.error(`  ↳ ${err}`))
      }
    } catch (error) {
      this.log.error(
        `Build #${buildId} failed: ${error instanceof Error ? error.message : String(error)}`,
      )
      console.error(error)
    } finally {
      this.isBuilding = false
    }
  }

  private cleanup(): void {
    this.log.info('Cleaning up...')

    // Clean up temp directory
    if (this.tempDir && fs.existsSync(this.tempDir)) {
      try {
        fs.rmSync(this.tempDir, { recursive: true, force: true })
        this.log.success('Temp directory cleaned up')
      } catch (error) {
        this.log.error(
          `Failed to clean up temp directory: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    process.exit(0)
  }

  private log = {
    info: (msg: string) => console.log(chalk.blue('ℹ️ ') + ` ${msg}`),
    change: (path: string) =>
      console.log(chalk.yellow('📝') + ` File changed: ${path}`),
    build: (msg: string) => console.log(chalk.cyan('🔨') + ` ${msg}`),
    sync: (msg: string) => console.log(chalk.magenta(' ') + ` ${msg}`),
    error: (msg: string) => console.error(chalk.red('❌') + ` ${msg}`),
    success: (msg: string) => console.log(chalk.green('✅') + ` ${msg}`),
    warning: (msg: string) => console.log(chalk.yellow('⚠️ ') + ` ${msg}`),
  }
}
