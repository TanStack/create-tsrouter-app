import { describe, expect, it } from 'vitest'

import { createMemoryEnvironment } from '../../src/environment.js'
import { installShadcnComponents } from '../../src/integrations/shadcn.js'

import type { Options } from '../../src/types.js'

describe('shadcn', () => {
  it('should skip if no components are selected', async () => {
    const { environment, output } = createMemoryEnvironment()
    environment.startRun()
    await installShadcnComponents(environment, '/test', {
      packageManager: 'pnpm',
      chosenAddOns: [],
      projectName: 'test',
      typescript: true,
      spinner: () => ({
        start: () => {},
        succeed: () => {},
        fail: () => {},
      }),
    } as unknown as Options)
    environment.finishRun()

    expect(output.commands).toEqual([])
  })

  it('should add shadcn components for add-ons', async () => {
    const { environment, output } = createMemoryEnvironment()
    environment.startRun()
    await installShadcnComponents(environment, '/test', {
      packageManager: 'pnpm',
      chosenAddOns: [
        {
          id: 'shadcn',
          shadcnComponents: ['button'],
        },
        {
          id: 'test-1',
          shadcnComponents: ['button', 'card'],
        },
      ],
      projectName: 'test',
      typescript: true,
      spinner: () => ({
        start: () => {},
        succeed: () => {},
        fail: () => {},
      }),
    } as unknown as Options)
    environment.finishRun()

    expect(output.commands).toEqual([
      {
        command: 'pnpm',
        args: [
          'dlx',
          'shadcn@latest',
          'add',
          '--silent',
          '--yes',
          'button',
          'card',
        ],
      },
    ])
  })

  it('should add shadcn components in the starter', async () => {
    const { environment, output } = createMemoryEnvironment()
    environment.startRun()
    await installShadcnComponents(environment, '/test', {
      packageManager: 'pnpm',
      chosenAddOns: [
        {
          id: 'shadcn',
        },
      ],
      projectName: 'test',
      typescript: true,
      starter: {
        shadcnComponents: ['button', 'card'],
      },
      spinner: () => ({
        start: () => {},
        succeed: () => {},
        fail: () => {},
      }),
    } as unknown as Options)
    environment.finishRun()

    expect(output.commands).toEqual([
      {
        command: 'pnpm',
        args: [
          'dlx',
          'shadcn@latest',
          'add',
          '--silent',
          '--yes',
          'button',
          'card',
        ],
      },
    ])
  })
})
