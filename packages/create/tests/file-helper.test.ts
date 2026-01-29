import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fs, vol } from 'memfs'

import {
  findFilesRecursively,
  isDirectory,
  readFileHelper,
  relativePath,
} from '../src/file-helpers.js'

vi.mock('node:fs', () => fs)
vi.mock('node:fs/promises', () => fs.promises)

beforeEach(() => {
  vol.reset()
})

describe('relativePath', () => {
  it('relative path with the same directory and strip extension', () => {
    expect(relativePath('src/utils.ts', 'src/index.ts', true)).toBe('./index')
  })
  it('relative path with the same directory', () => {
    expect(relativePath('src/utils.ts', 'src/index.ts')).toBe('./index.ts')
  })
  it('relative from a subdirectory', () => {
    expect(relativePath('src/something/utils.ts', 'src/index.ts')).toBe(
      '../index.ts',
    )
  })
  it('relative to a subdirectory', () => {
    expect(relativePath('src/utils.ts', 'src/something/index.ts')).toBe(
      './something/index.ts',
    )
  })
  it('same deep directory', () => {
    expect(
      relativePath('src/foo/bar/baz/utils.ts', 'src/foo/bar/baz/index.ts'),
    ).toBe('./index.ts')
  })
  it('up several levels and down several levels', () => {
    expect(relativePath('src/bar/baz/utils.ts', 'src/foo/bar/index.ts')).toBe(
      '../../foo/bar/index.ts',
    )
  })
  it('relative path with a different directory', () => {
    expect(
      relativePath(
        'src/routes/__root.tsx.ejs',
        'src/integrations/tanstack-query/layout.tsx',
      ),
    ).toBe('../integrations/tanstack-query/layout.tsx')
  })
  it('windows', () => {
    expect(
      relativePath(
        '.\\src\\main.tsx.ejs',
        'src/integrations/tanstack-query/root-provider.tsx',
      ),
    ).toBe('./integrations/tanstack-query/root-provider.tsx')
  })
})

describe('readFileHelper', () => {
  it('should read a file', async () => {
    vol.mkdirSync('/src')
    fs.writeFileSync('/src/test.txt', 'Hello')
    expect(readFileHelper('/src/test.txt')).toBe('Hello')
  })
  it('should read a binary file', async () => {
    vol.mkdirSync('/src')
    fs.writeFileSync('/src/test.jpg', 'Hello')
    expect(readFileHelper('/src/test.jpg')).toBe('base64::SGVsbG8=')
  })
})

describe('isDirectory', () => {
  it('should check on files and directories', () => {
    vol.mkdirSync('/src')
    fs.writeFileSync('/src/test.txt', 'Hello')
    expect(isDirectory('/src/test.txt')).toBe(false)
    expect(isDirectory('/src')).toBe(true)
  })
})

describe('findFilesRecursively', () => {
  it('find files recursively', () => {
    vol.mkdirSync('/src/subdir/subdir2', { recursive: true })
    fs.writeFileSync('/src/test.txt', 'Hello')
    fs.writeFileSync('/src/subdir/test.txt', 'Hello')
    fs.writeFileSync('/src/subdir/subdir2/test.txt', 'Hello')

    const files = {}
    findFilesRecursively('/src', files)

    expect(Object.keys(files)).toEqual([
      '/src/subdir/subdir2/test.txt',
      '/src/subdir/test.txt',
      '/src/test.txt',
    ])
  })
})
