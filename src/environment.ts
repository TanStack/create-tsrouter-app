import {
  appendFile,
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname } from 'node:path'
import { execa } from 'execa'

export type Environment = {
  startRun: () => void
  finishRun: () => void
  getErrors: () => Array<string>

  appendFile: (path: string, contents: string) => Promise<void>
  copyFile: (from: string, to: string) => Promise<void>
  writeFile: (path: string, contents: string) => Promise<void>
  execute: (command: string, args: Array<string>, cwd: string) => Promise<void>

  readFile: (path: string, encoding?: BufferEncoding) => Promise<string>
  exists: (path: string) => boolean
  readdir: (path: string) => Array<string>
  isDirectory: (path: string) => boolean
}

export function createDefaultEnvironment(): Environment {
  let errors: Array<string> = []
  return {
    startRun: () => {
      errors = []
    },
    finishRun: () => {},
    getErrors: () => errors,

    appendFile: async (path: string, contents: string) => {
      await mkdir(dirname(path), { recursive: true })
      return appendFile(path, contents)
    },
    copyFile: async (from: string, to: string) => {
      await mkdir(dirname(to), { recursive: true })
      return copyFile(from, to)
    },
    writeFile: async (path: string, contents: string) => {
      await mkdir(dirname(path), { recursive: true })
      return writeFile(path, contents)
    },
    execute: async (command: string, args: Array<string>, cwd: string) => {
      try {
        await execa(command, args, {
          cwd,
        })
      } catch {
        errors.push(
          `Command "${command} ${args.join(' ')}" did not run successfully. Please run this manually in your project.`,
        )
      }
    },

    readFile: (path: string, encoding?: BufferEncoding) =>
      readFile(path, { encoding: encoding || 'utf8' }),
    exists: (path: string) => existsSync(path),
    readdir: (path) => readdirSync(path),
    isDirectory: (path) => {
      const stat = statSync(path)
      return stat.isDirectory()
    },
  }
}
