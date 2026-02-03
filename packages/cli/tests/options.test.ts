import { beforeEach, describe, it, expect, vi } from 'vitest'

import { promptForCreateOptions } from '../src/options'
import {
  __testClearFrameworks,
  __testRegisterFramework,
} from '@tanstack/create'

import * as prompts from '../src/ui-prompts'

import type { Framework } from '@tanstack/create'

import type { CliOptions } from '../src/types'

vi.mock('../src/ui-prompts')

beforeEach(() => {
  __testClearFrameworks()
  __testRegisterFramework({
    id: 'react-cra',
    name: 'react',
    getAddOns: () => [
      {
        id: 'react-query',
        type: 'add-on',
        modes: ['file-router'],
      },
      {
        id: 'tanstack-chat',
        type: 'add-on',
        modes: ['file-router'],
      },
      {
        id: 'biome',
        type: 'toolchain',
        modes: ['file-router'],
      },
    ],
    supportedModes: {
      'file-router': {
        displayName: 'File Router',
        description: 'TanStack Start with file-based routing',
        forceTypescript: true,
      },
    },
  } as unknown as Framework)

  __testRegisterFramework({
    id: 'solid',
    name: 'solid',
    getAddOns: () => [],
  } as unknown as Framework)
})

const baseCliOptions: CliOptions = {
  framework: 'react-cra',
  addOns: [],
  toolchain: undefined,
  projectName: undefined,
  git: undefined,
}

function setBasicSpies() {
  vi.spyOn(prompts, 'getProjectName').mockImplementation(async () => 'hello')
  vi.spyOn(prompts, 'selectPackageManager').mockImplementation(
    async () => 'npm',
  )
  vi.spyOn(prompts, 'selectToolchain').mockImplementation(async () => undefined)
  vi.spyOn(prompts, 'selectAddOns').mockImplementation(async () => [])
}

describe('promptForCreateOptions', () => {
  //// Project name

  it('prompt for a project name', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions(baseCliOptions, {})

    expect(options?.projectName).toBe('hello')
  })

  it('accept incoming project name', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions(
      { ...baseCliOptions, projectName: 'override' },
      {},
    )

    expect(options?.projectName).toBe('override')
  })

  //// Mode is always file-router (TanStack Start)

  it('mode should always be file-router', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions(baseCliOptions, {})

    expect(options?.mode).toBe('file-router')
    expect(options?.typescript).toBe(true)
  })

  //// Tailwind is always enabled

  it('tailwind is always enabled', async () => {
    setBasicSpies()
    const options = await promptForCreateOptions(baseCliOptions, {})

    expect(options?.tailwind).toBe(true)
  })

  //// Package manager

  it('uses the package manager from the cli options', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions(
      { ...baseCliOptions, packageManager: 'bun' },
      {},
    )

    expect(options?.packageManager).toBe('bun')
  })

  it('detects package manager from environment', async () => {
    setBasicSpies()

    process.env.npm_config_userconfig = 'blarg'

    const options = await promptForCreateOptions(
      { ...baseCliOptions, packageManager: undefined },
      {},
    )

    expect(options?.packageManager).toBe('pnpm')
  })

  //// Add-ons
  it('should be clean when no add-ons are selected', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions({ ...baseCliOptions }, {})

    expect(options?.chosenAddOns).toEqual([])
  })

  it('should select biome when toolchain is specified', async () => {
    setBasicSpies()

    vi.spyOn(prompts, 'selectToolchain').mockImplementation(async () => 'biome')

    const options = await promptForCreateOptions(
      { ...baseCliOptions, toolchain: 'biome' },
      {},
    )

    expect(options?.chosenAddOns.map((a) => a.id).sort()).toEqual(['biome'])
  })

  it('should handle forced add-ons', async () => {
    setBasicSpies()

    vi.spyOn(prompts, 'selectToolchain').mockImplementation(
      async () => undefined,
    )

    const options = await promptForCreateOptions(
      { ...baseCliOptions },
      { forcedAddOns: ['react-query'] },
    )

    expect(options?.chosenAddOns.map((a) => a.id).sort()).toEqual([
      'react-query',
    ])
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
  })

  it('should handle add-ons from the CLI', async () => {
    setBasicSpies()

    const options = await promptForCreateOptions(
      { ...baseCliOptions, addOns: ['biome', 'react-query'] },
      {},
    )

    expect(options?.chosenAddOns.map((a) => a.id).sort()).toEqual([
      'biome',
      'react-query',
    ])
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
  })

  it('should handle user-selected add-ons', async () => {
    setBasicSpies()

    vi.spyOn(prompts, 'selectAddOns').mockImplementation(async () =>
      Promise.resolve(['biome', 'react-query']),
    )

    const options = await promptForCreateOptions(
      { ...baseCliOptions, addOns: undefined },
      {},
    )

    expect(options?.chosenAddOns.map((a) => a.id).sort()).toEqual([
      'biome',
      'react-query',
    ])
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
  })
})
