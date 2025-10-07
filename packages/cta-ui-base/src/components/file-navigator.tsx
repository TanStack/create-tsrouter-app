import { useMemo, useState } from 'react'
import { FileText, Folder } from 'lucide-react'

import {
  useApplicationMode,
  useDryRun,
  useFilters,
  useOriginalOutput,
  useProjectLocalFiles,
  useReady,
} from '../store/project'

import { getFileClass, twClasses } from '../file-classes'

import FileViewer from './file-viewer'
import FileTree from './file-tree'
import WebContainerProvider from './web-container-provider'
import { WebContainerPreview } from './webcontainer-preview'

import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

import type { FileTreeItem } from '../types'

export function Filters() {
  const { includedFiles, toggleFilter } = useFilters()

  return (
    <div className="bg-white dark:bg-black/40 shadow-xl p-4 rounded-lg flex flex-row items-center gap-4 mb-2">
      <h3 className="font-medium whitespace-nowrap">File Filters</h3>
      <div className="flex flex-row items-center">
        <Switch
          id="unchanged"
          checked={includedFiles.includes('unchanged')}
          onCheckedChange={() => toggleFilter('unchanged')}
          className="mr-2"
        />
        <Label htmlFor="unchanged" className={twClasses.unchanged}>
          Unchanged
        </Label>
      </div>
      <div className="flex flex-row items-center">
        <Switch
          id="added"
          checked={includedFiles.includes('added')}
          onCheckedChange={() => toggleFilter('added')}
          className="mr-2"
        />
        <Label htmlFor="added" className={twClasses.added}>
          Added
        </Label>
      </div>
      <div className="flex flex-row items-center">
        <Switch
          id="modified"
          checked={includedFiles.includes('modified')}
          onCheckedChange={() => toggleFilter('modified')}
          className="mr-2"
        />
        <Label htmlFor="modified" className={twClasses.modified}>
          Modified
        </Label>
      </div>
      <div className="flex flex-row items-center">
        <Switch
          id="deleted"
          checked={includedFiles.includes('deleted')}
          onCheckedChange={() => toggleFilter('deleted')}
          className="mr-2"
        />
        <Label htmlFor="deleted" className={twClasses.deleted}>
          Deleted
        </Label>
      </div>
      <div className="flex flex-row items-center">
        <Switch
          id="overwritten"
          checked={includedFiles.includes('overwritten')}
          onCheckedChange={() => toggleFilter('overwritten')}
          className="mr-2"
        />
        <Label htmlFor="overwritten" className={twClasses.overwritten}>
          Overwritten
        </Label>
      </div>
    </div>
  )
}

export default function FileNavigator() {
  const [selectedFile, setSelectedFile] = useState<string | null>(
    './package.json',
  )

  const projectFiles = useOriginalOutput()
  const localTree = useProjectLocalFiles()
  const dryRunOutput = useDryRun()

  const mode = useApplicationMode()

  const tree = dryRunOutput.files
  const originalTree: Record<string, string> | undefined =
    mode === 'setup' ? dryRunOutput.files : projectFiles?.files
  const deletedFiles = dryRunOutput.deletedFiles

  const [originalFileContents, setOriginalFileContents] = useState<string>()
  const [modifiedFileContents, setModifiedFileContents] = useState<string>()

  const { includedFiles } = useFilters()

  const fileTree = useMemo(() => {
    const treeData: Array<FileTreeItem> = []

    if (!originalTree || !localTree) {
      return treeData
    }

    const allFileSet = Array.from(
      new Set([
        ...Object.keys(tree),
        ...Object.keys(localTree),
        ...Object.keys(originalTree),
      ]),
    )

    allFileSet.sort().forEach((file) => {
      const strippedFile = file.replace('./', '')
      const parts = strippedFile.split('/')

      let currentLevel = treeData
      parts.forEach((part, index) => {
        const existingNode = currentLevel.find((node) => node.name === part)
        if (existingNode) {
          currentLevel = existingNode.children || []
        } else {
          const fileInfo = getFileClass(
            file,
            tree,
            originalTree,
            localTree,
            deletedFiles,
          )

          if (
            index === parts.length - 1 &&
            !includedFiles.includes(fileInfo.fileClass)
          ) {
            return
          }
          if (index === parts.length - 1 && file === selectedFile) {
            setModifiedFileContents(fileInfo.modifiedFile)
            setOriginalFileContents(fileInfo.originalFile)
          }

          const newNode: FileTreeItem = {
            id: parts.slice(0, index + 1).join('/'),
            name: part,
            fullPath: strippedFile,
            children: index < parts.length - 1 ? [] : undefined,
            icon:
              index < parts.length - 1
                ? () => <Folder className="w-4 h-4 mr-2" />
                : () => <FileText className="w-4 h-4 mr-2" />,
            onClick:
              index === parts.length - 1
                ? () => {
                    setSelectedFile(file)
                    setModifiedFileContents(fileInfo.modifiedFile)
                    setOriginalFileContents(fileInfo.originalFile)
                  }
                : undefined,
            className: twClasses[fileInfo.fileClass],
            ...fileInfo,
            contents: tree[file] || localTree[file] || originalTree[file],
          }
          currentLevel.push(newNode)
          currentLevel = newNode.children!
        }
      })
    })
    return treeData
  }, [tree, originalTree, localTree, includedFiles])

  const ready = useReady()

  // Prepare project files for WebContainer
  const webContainerFiles = useMemo(() => {
    console.log('Preparing WebContainer files, tree:', tree)
    if (!tree) {
      console.log('Tree is empty, returning empty array')
      return []
    }
    const files = Object.entries(tree).map(([path, content]) => ({
      path,
      content,
    }))
    console.log('WebContainer files prepared:', files.length, 'files')
    return files
  }, [tree])

  if (!ready) {
    return null
  }

  return (
    <WebContainerProvider projectFiles={webContainerFiles}>
      <div className="bg-white dark:bg-black/50 rounded-lg p-2 sm:p-4">
        {mode === 'add' && <Filters />}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-0">
            <div className="flex flex-row @container">
              <div className="w-1/3 @6xl:w-1/4 bg-gray-500/10 rounded-l-lg">
                <FileTree selectedFile={selectedFile} tree={fileTree} />
              </div>
              <div className="w-2/3 @6xl:w-3/4">
                {selectedFile && modifiedFileContents ? (
                  <FileViewer
                    filePath={selectedFile}
                    originalFile={originalFileContents}
                    modifiedFile={modifiedFileContents}
                  />
                ) : null}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="h-[800px]">
              <WebContainerPreview />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WebContainerProvider>
  )
}
