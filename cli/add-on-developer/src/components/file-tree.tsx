import { useMemo } from 'react'
import { FileText, Folder } from 'lucide-react'

import { TreeView } from '@/components/ui/tree-view'

import type { TreeDataItem } from '@/components/ui/tree-view'

export default function FileTree({
  prefix,
  tree,
  originalTree,
  onFileSelected,
  extraTreeItems = [],
}: {
  prefix: string
  tree: Record<string, string>
  originalTree: Record<string, string>
  onFileSelected: (file: string) => void
  extraTreeItems?: Array<TreeDataItem>
}) {
  const computedTree = useMemo(() => {
    const treeData: Array<TreeDataItem> = []

    function changed(file: string) {
      if (!originalTree[file]) {
        return true
      }
      return tree[file] !== originalTree[file]
    }

    Object.keys(tree)
      .sort()
      .forEach((file) => {
        const parts = file.replace(`${prefix}/`, '').split('/')

        let currentLevel = treeData
        parts.forEach((part, index) => {
          const existingNode = currentLevel.find((node) => node.name === part)
          if (existingNode) {
            currentLevel = existingNode.children || []
          } else {
            const newNode: TreeDataItem = {
              id: index === parts.length - 1 ? file : `${file}-${index}`,
              name: part,
              children: index < parts.length - 1 ? [] : undefined,
              icon:
                index < parts.length - 1
                  ? () => <Folder className="w-4 h-4 mr-2" />
                  : () => <FileText className="w-4 h-4 mr-2" />,
              onClick:
                index === parts.length - 1
                  ? () => {
                      onFileSelected(file)
                    }
                  : undefined,
              className:
                index === parts.length - 1 && changed(file)
                  ? 'text-green-300'
                  : '',
            }
            currentLevel.push(newNode)
            currentLevel = newNode.children!
          }
        })
      })
    return [...extraTreeItems, ...treeData]
  }, [prefix, tree, originalTree, extraTreeItems])

  return (
    <TreeView
      data={computedTree}
      defaultNodeIcon={() => <Folder className="w-4 h-4 mr-2" />}
      defaultLeafIcon={() => <FileText className="w-4 h-4 mr-2" />}
      className="max-w-1/4 w-1/4 pr-2"
    />
  )
}
