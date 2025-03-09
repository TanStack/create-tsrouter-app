import { readFile } from 'node:fs/promises'
import { dirname, join, basename, extname } from 'node:path'

import { createDefaultEnvironment } from '../src/environment.js'

const IGNORE_EXTENSIONS = ['.png', '.ico', '.svg']

export function createTestEnvironment(projectName: string) {
  const environment = createDefaultEnvironment()

  const output: {
    files: Record<string, string>
    commands: Array<{
      command: string
      args: Array<string>
    }>
  } = {
    files: {},
    commands: [],
  }

  const isTemplatePath = (path: string) => dirname(path).includes('templates')
  const trimProjectRelativePath = (path: string) =>
    join(
      dirname(path).replace(new RegExp(`^.*/${projectName}`), ''),
      basename(path),
    )

  environment.appendFile = async (path: string, contents: string) => {
    const relPath = trimProjectRelativePath(path)
    output.files[relPath] = (output.files[relPath] || '') + contents
  }
  environment.copyFile = async (from: string, to: string) => {
    if (!IGNORE_EXTENSIONS.includes(extname(from))) {
      const contents = (await readFile(from)).toString()
      const relPath = trimProjectRelativePath(to)
      output.files[relPath] = contents
    }
  }
  environment.execute = async (command: string, args: Array<string>) => {
    output.commands.push({
      command,
      args,
    })
  }
  environment.readFile = async (path: string, encoding?: BufferEncoding) => {
    if (isTemplatePath(path)) {
      return (await readFile(path, encoding)).toString()
    }
    const relPath = trimProjectRelativePath(path)
    return output.files[relPath] || ''
  }
  environment.writeFile = async (path: string, contents: string) => {
    if (!IGNORE_EXTENSIONS.includes(extname(path))) {
      const relPath = trimProjectRelativePath(path)
      output.files[relPath] = contents
    }
  }
  return {
    environment,
    output,
  }
}
