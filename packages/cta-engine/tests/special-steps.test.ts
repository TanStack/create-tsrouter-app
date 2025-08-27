import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fs from 'node:fs'
import { postInitScript } from '../src/special-steps/post-init-script.js'
import { rimrafNodeModules } from '../src/special-steps/rimraf-node-modules.js'
import { runSpecialSteps } from '../src/special-steps/index.js'

import type { Environment, Options } from '../src/types.js'

vi.mock('node:fs')

describe('Special Steps', () => {
  let mockEnvironment: Environment
  let mockOptions: Options

  beforeEach(() => {
    mockEnvironment = {
      exists: vi.fn(),
      execute: vi.fn(),
      startStep: vi.fn(),
      finishStep: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      rimraf: vi.fn(),
      deleteFile: vi.fn(),
      readFile: vi.fn(),
    } as unknown as Environment

    mockOptions = {
      targetDir: '/test/project',
      packageManager: 'npm',
      chosenAddOns: [],
    } as Options
  })

  describe('postInitScript', () => {
    it('should run post-cta-init script when it exists', async () => {
      const mockPackageJson = {
        scripts: {
          'post-cta-init': 'echo "Running post-cta-init"',
        },
      }

      vi.spyOn(mockEnvironment, 'exists').mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(mockPackageJson),
      )

      await postInitScript(mockEnvironment, mockOptions)

      expect(mockEnvironment.startStep).toHaveBeenCalledWith({
        id: 'post-init-script',
        type: 'command',
        message: 'Running post-cta-init script...',
      })

      expect(mockEnvironment.execute).toHaveBeenCalledWith(
        'npm',
        ['run', 'post-cta-init'],
        '/test/project',
        { inherit: true },
      )

      expect(mockEnvironment.finishStep).toHaveBeenCalledWith(
        'post-init-script',
        'Post-cta-init script complete',
      )
    })

    it('should skip when package.json does not exist', async () => {
      vi.spyOn(mockEnvironment, 'exists').mockReturnValue(false)

      await postInitScript(mockEnvironment, mockOptions)

      expect(mockEnvironment.warn).toHaveBeenCalledWith(
        'Warning',
        'No package.json found, skipping post-cta-init script',
      )
      expect(mockEnvironment.execute).not.toHaveBeenCalled()
    })

    it('should skip when post-cta-init script does not exist', async () => {
      const mockPackageJson = {
        scripts: {
          build: 'echo "Building"',
        },
      }

      vi.spyOn(mockEnvironment, 'exists').mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify(mockPackageJson),
      )

      await postInitScript(mockEnvironment, mockOptions)

      // Note: The function now skips silently without calling info()
      expect(mockEnvironment.execute).not.toHaveBeenCalled()
    })

    it('should handle different package managers', async () => {
      const packageManagers = ['yarn', 'pnpm', 'bun', 'deno'] as const
      const expectedCommands = {
        yarn: { command: 'yarn', args: ['run', 'post-cta-init'] },
        pnpm: { command: 'pnpm', args: ['post-cta-init'] },
        bun: { command: 'bun', args: ['run', 'post-cta-init'] },
        deno: { command: 'deno', args: ['task', 'post-cta-init'] },
      }

      for (const pm of packageManagers) {
        mockOptions.packageManager = pm
        vi.clearAllMocks()
        vi.spyOn(mockEnvironment, 'exists').mockReturnValue(true)
        vi.mocked(fs.readFileSync).mockReturnValue(
          JSON.stringify({ scripts: { 'post-cta-init': 'test' } }),
        )

        await postInitScript(mockEnvironment, mockOptions)

        const expected = expectedCommands[pm]
        expect(mockEnvironment.execute).toHaveBeenCalledWith(
          expected.command,
          expected.args,
          '/test/project',
          { inherit: true },
        )
      }
    })
  })

  describe('runSpecialSteps', () => {
    it('should run multiple special steps in sequence', async () => {
      const specialSteps = ['rimraf-node-modules', 'post-init-script']

      vi.spyOn(mockEnvironment, 'exists').mockReturnValue(true)
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ scripts: { 'post-cta-init': 'test' } }),
      )

      await runSpecialSteps(mockEnvironment, mockOptions, specialSteps)

      expect(mockEnvironment.startStep).toHaveBeenCalledWith({
        id: 'special-steps',
        type: 'command',
        message: 'Running special steps...',
      })

      expect(mockEnvironment.rimraf).toHaveBeenCalled()
      expect(mockEnvironment.execute).toHaveBeenCalled()
      expect(mockEnvironment.finishStep).toHaveBeenCalledWith(
        'special-steps',
        'Special steps complete',
      )
    })

    it('should handle unknown special steps', async () => {
      const specialSteps = ['unknown-step']

      await runSpecialSteps(mockEnvironment, mockOptions, specialSteps)

      expect(mockEnvironment.error).toHaveBeenCalledWith(
        'Special step unknown-step not found',
      )
    })
  })
})
