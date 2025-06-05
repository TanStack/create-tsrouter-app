import type { FileClass } from './types'

export const twClasses: Record<FileClass, string> = {
  unchanged: 'text-gray-500',
  added: 'text-green-500 font-bold',
  modified: 'text-blue-500 italic',
  deleted: 'text-red-500 line-through',
  overwritten: 'text-red-700 underline',
}

export type FileClassAndInfo = {
  fileClass: FileClass
  originalFile?: string
  modifiedFile?: string
}

export const getFileClass = (
  file: string,
  tree: Record<string, string>,
  originalTree: Record<string, string>,
  localTree: Record<string, string>,
  deletedFiles: Array<string>,
): FileClassAndInfo => {
  if (localTree[file]) {
    if (deletedFiles.includes(file)) {
      return { fileClass: 'deleted', originalFile: localTree[file] }
    }
    // We have a local file and it's in the new tree
    if (tree[file]) {
      // Our new tree has changed this file
      if (localTree[file] !== tree[file]) {
        // Was the local tree different from the original?
        if (originalTree[file] && localTree[file] !== originalTree[file]) {
          // Yes, it was overwritten
          return {
            fileClass: 'overwritten',
            originalFile: localTree[file],
            modifiedFile: tree[file],
          }
        } else {
          // No, it just being modified
          return {
            fileClass: 'modified',
            originalFile: localTree[file],
            modifiedFile: tree[file],
          }
        }
      }
    }
    return { fileClass: 'unchanged', modifiedFile: localTree[file] }
  } else {
    return { fileClass: 'added', modifiedFile: tree[file] }
  }
}
