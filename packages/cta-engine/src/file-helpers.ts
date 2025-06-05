import { readdir } from 'node:fs/promises'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, extname, resolve } from 'node:path'
import parseGitignore from 'parse-gitignore'
import ignore from 'ignore'

import type { Environment } from './types'

const BINARY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico']

export function readFileHelper(path: string): string {
  if (isBinaryFile(path)) {
    return `base64::${readFileSync(path).toString('base64')}`
  } else {
    return readFileSync(path, 'utf-8').toString()
  }
}

export function isBinaryFile(path: string): boolean {
  return BINARY_EXTENSIONS.includes(extname(path))
}

export function convertBinaryContentsToBase64(contents: any): string {
  return `base64::${Buffer.from(contents).toString('base64')}`
}

export function isBase64(content: string): boolean {
  return content.startsWith('base64::')
}

export function getBinaryFile(content: string): string | null {
  if (content.startsWith('base64::')) {
    const binaryContent = Buffer.from(content.replace('base64::', ''), 'base64')
    return binaryContent as unknown as string
  }
  return null
}

export function relativePath(from: string, to: string) {
  const fixedOnWindows = from.startsWith('.\\')
    ? from.replace(/\\/g, '/')
    : from
  const cleanedFrom = fixedOnWindows.startsWith('./')
    ? fixedOnWindows.slice(2)
    : from
  const cleanedTo = to.startsWith('./') ? to.slice(2) : to

  const fromSegments = cleanedFrom.split('/')
  const toSegments = cleanedTo.split('/')

  fromSegments.pop()
  toSegments.pop()

  let commonIndex = 0
  while (
    commonIndex < fromSegments.length &&
    commonIndex < toSegments.length &&
    fromSegments[commonIndex] === toSegments[commonIndex]
  ) {
    commonIndex++
  }

  const upLevels = fromSegments.length - commonIndex
  const downLevels = toSegments.slice(commonIndex)

  if (upLevels === 0 && downLevels.length === 0) {
    return `./${basename(to)}`
  } else if (upLevels === 0 && downLevels.length > 0) {
    return `./${downLevels.join('/')}/${basename(to)}`
  } else {
    const relativePath = [...Array(upLevels).fill('..'), ...downLevels].join(
      '/',
    )
    return `${relativePath}/${basename(to)}`
  }
}

export function isDirectory(path: string): boolean {
  return statSync(path).isDirectory()
}

export function findFilesRecursively(
  path: string,
  files: Record<string, string>,
) {
  const dirFiles = readdirSync(path)
  for (const file of dirFiles) {
    const filePath = resolve(path, file)
    if (isDirectory(filePath)) {
      findFilesRecursively(filePath, files)
    } else {
      files[filePath] = readFileHelper(filePath)
    }
  }
}

async function recursivelyGatherFilesHelper(
  basePath: string,
  path: string,
  files: Record<string, string>,
  ignore: (filePath: string) => boolean,
) {
  const dirFiles = await readdir(path, { withFileTypes: true })
  for (const file of dirFiles) {
    if (ignore(file.name)) {
      continue
    }
    if (file.isDirectory()) {
      await recursivelyGatherFilesHelper(
        basePath,
        resolve(path, file.name),
        files,
        ignore,
      )
    } else {
      const filePath = resolve(path, file.name)
      files[filePath.replace(basePath, '.')] = await readFileHelper(filePath)
    }
  }
}

export async function recursivelyGatherFiles(
  path: string,
  includeProjectFiles = true,
) {
  const ignore = createIgnore(path, includeProjectFiles)
  const files: Record<string, string> = {}
  await recursivelyGatherFilesHelper(path, path, files, ignore)
  return files
}

async function recursivelyGatherFilesFromEnvironmentHelper(
  environment: Environment,
  basePath: string,
  path: string,
  files: Record<string, string>,
  ignore: (filePath: string) => boolean,
) {
  const dirFiles = await environment.readdir(path)
  for (const file of dirFiles) {
    if (ignore(file)) {
      continue
    }
    if (environment.isDirectory(resolve(path, file))) {
      await recursivelyGatherFilesFromEnvironmentHelper(
        environment,
        basePath,
        resolve(path, file),
        files,
        ignore,
      )
    } else {
      const filePath = resolve(path, file)
      files[filePath.replace(basePath, '.')] =
        await environment.readFile(filePath)
    }
  }
}

export async function recursivelyGatherFilesFromEnvironment(
  environment: Environment,
  path: string,
  includeProjectFiles = true,
) {
  const ignore = createIgnore(path, includeProjectFiles)
  const files: Record<string, string> = {}
  await recursivelyGatherFilesFromEnvironmentHelper(
    environment,
    path,
    path,
    files,
    ignore,
  )
  return files
}

export const IGNORE_FILES = [
  '.starter',
  '.add-on',
  '.cta.json',
  '.git',
  'add-on-info.json',
  'add-on.json',
  'build',
  'bun.lock',
  'bun.lockb',
  'deno.lock',
  'dist',
  'node_modules',
  'package-lock.json',
  'pnpm-lock.yaml',
  'starter.json',
  'starter-info.json',
  'yarn.lock',
]

const PROJECT_FILES = ['package.json']

export function createIgnore(path: string, includeProjectFiles = true) {
  const ignoreList = existsSync(resolve(path, '.gitignore'))
    ? (
        parseGitignore(
          readFileSync(resolve(path, '.gitignore')),
        ) as unknown as { patterns: Array<string> }
      ).patterns
    : []
  const ig = ignore().add(ignoreList)
  return (filePath: string) => {
    const fileName = basename(filePath)
    if (
      IGNORE_FILES.includes(fileName) ||
      (includeProjectFiles && PROJECT_FILES.includes(fileName))
    ) {
      return true
    }
    const nameWithoutDotSlash = fileName.replace(/^\.\//, '')
    return ig.ignores(nameWithoutDotSlash)
  }
}

export function cleanUpFiles(
  files: Record<string, string>,
  targetDir?: string,
) {
  return Object.keys(files).reduce<Record<string, string>>((acc, file) => {
    if (basename(file) !== '.cta.json') {
      acc[targetDir ? file.replace(targetDir, '.') : file] = files[file]
    }
    return acc
  }, {})
}

export function cleanUpFileArray(files: Array<string>, targetDir?: string) {
  return files.reduce<Array<string>>((acc, file) => {
    if (basename(file) !== '.cta.json') {
      acc.push(targetDir ? file.replace(targetDir, '.') : file)
    }
    return acc
  }, [])
}
