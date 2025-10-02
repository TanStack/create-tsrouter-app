import { beforeEach, describe, expect, it } from 'vitest'

import { normalizeOptions } from '../src/command-line.js'
import {
  __testRegisterFramework,
  __testClearFrameworks,
} from '@tanstack/cta-engine/dist/frameworks.js'

beforeEach(() => {
  __testClearFrameworks()
})

describe('normalizeOptions', () => {
  it('should return undefined if project name is not provided', async () => {
    const options = await normalizeOptions({})
    expect(options).toBeUndefined()
  })

  it('should return enable typescript based on the framework', async () => {
    const jsOptions = await normalizeOptions({
      projectName: 'test',
      template: 'javascript',
    })
    expect(jsOptions?.typescript).toBe(false)
    expect(jsOptions?.mode).toBe('code-router')

    const tsOptions = await normalizeOptions({
      projectName: 'test',
      template: 'typescript',
    })
    expect(tsOptions?.typescript).toBe(true)
    expect(tsOptions?.mode).toBe('code-router')

    const frOptions = await normalizeOptions({
      projectName: 'test',
      template: 'file-router',
    })
    expect(frOptions?.typescript).toBe(true)
    expect(frOptions?.mode).toBe('file-router')
  })

  it('should return enable tailwind if the framework is solid', async () => {
    const solidOptions = await normalizeOptions({
      projectName: 'test',
      framework: 'solid',
    })
    expect(solidOptions?.tailwind).toBe(true)

    const twOptions = await normalizeOptions({
      projectName: 'test',
      tailwind: true,
    })
    expect(twOptions?.tailwind).toBe(true)

    const noOptions = await normalizeOptions({
      projectName: 'test',
    })
    expect(noOptions?.tailwind).toBe(false)
  })

  it('should handle a starter url', async () => {
    __testRegisterFramework({
      id: 'solid',
      name: 'Solid',
      getAddOns: () => [
        {
          id: 'nitro',
          name: 'nitro',
          modes: ['file-router'],
          default: true,
        },
      ],
      supportedModes: {
        'code-router': {
          displayName: 'Code Router',
          description: 'TanStack Router using code to define the routes',
          forceTypescript: false,
        },
        'file-router': {
          displayName: 'File Router',
          description: 'TanStack Router using files to define the routes',
          forceTypescript: true,
        },
      },
    })
    fetch.mockResponseOnce(
      JSON.stringify({
        id: 'https://github.com/cta-dev/cta-starter-solid',
        tailwind: true,
        typescript: false,
        framework: 'solid',
        mode: 'file-router',
        type: 'starter',
        description: 'A starter for Solid',
        name: 'My Solid Starter',
        dependsOn: [],
        files: {},
        deletedFiles: [],
      }),
    )

    const options = await normalizeOptions({
      projectName: 'test',
      starter: 'https://github.com/cta-dev/cta-starter-solid',
      host: 'nitro',
    })
    expect(options?.mode).toBe('file-router')
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
    expect(options?.framework?.id).toBe('solid')
  })

  it('should default to react-cra if no framework is provided', async () => {
    __testRegisterFramework({
      id: 'react-cra',
      name: 'react',
    })
    const options = await normalizeOptions({
      projectName: 'test',
    })
    expect(options?.framework?.id).toBe('react-cra')
  })

  it('should handle forced addons', async () => {
    __testRegisterFramework({
      id: 'react-cra',
      name: 'react',
      getAddOns: () => [
        {
          id: 'foo',
          name: 'foobar',
          modes: ['file-router'],
        },
        {
          id: 'nitro',
          name: 'nitro',
          modes: ['file-router'],
          default: true,
        },
      ],
    })
    const options = await normalizeOptions(
      {
        projectName: 'test',
        framework: 'react-cra',
      },
      'file-router',
      ['foo'],
    )
    expect(options?.chosenAddOns.map((a) => a.id).includes('foo')).toBe(true)
  })

  it('should handle additional addons from the CLI', async () => {
    __testRegisterFramework({
      id: 'react-cra',
      name: 'react',
      getAddOns: () => [
        {
          id: 'foo',
          name: 'foobar',
          modes: ['file-router'],
        },
        {
          id: 'baz',
          name: 'baz',
          modes: ['file-router'],
        },
        {
          id: 'nitro',
          name: 'nitro',
          modes: ['file-router'],
          default: true,
        },
      ],
    })
    const options = await normalizeOptions(
      {
        projectName: 'test',
        addOns: ['baz'],
        framework: 'react-cra',
        template: 'file-router',
      },
      'file-router',
      ['foo'],
    )
    expect(options?.chosenAddOns.map((a) => a.id).includes('foo')).toBe(true)
    expect(options?.chosenAddOns.map((a) => a.id).includes('baz')).toBe(true)
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
  })

  it('should handle toolchain as an addon', async () => {
    __testRegisterFramework({
      id: 'react-cra',
      name: 'react',
      getAddOns: () => [
        {
          id: 'biome',
          name: 'Biome',
          modes: ['file-router', 'code-router'],
        },
        {
          id: 'nitro',
          name: 'nitro',
          modes: ['file-router', 'code-router'],
          default: true,
        },
      ],
    })
    const options = await normalizeOptions({
      projectName: 'test',
      toolchain: 'biome',
    })
    expect(options?.chosenAddOns.map((a) => a.id).includes('biome')).toBe(true)
    expect(options?.tailwind).toBe(true)
    expect(options?.typescript).toBe(true)
  })

  it('should handle the funky Windows edge case with CLI parsing', async () => {
    __testRegisterFramework({
      id: 'react-cra',
      name: 'react',
      getAddOns: () => [
        {
          id: 'foo',
          name: 'foobar',
          modes: ['file-router', 'code-router'],
        },
        {
          id: 'baz',
          name: 'baz',
          modes: ['file-router', 'code-router'],
        },
        {
          id: 'nitro',
          name: 'nitro',
          modes: ['file-router', 'code-router'],
          default: true,
        },
      ],
    })
    const options = await normalizeOptions({
      projectName: 'test',
      addOns: ['baz foo'],
    })
    expect(options?.chosenAddOns.map((a) => a.id).includes('foo')).toBe(true)
    expect(options?.chosenAddOns.map((a) => a.id).includes('baz')).toBe(true)
  })
})
