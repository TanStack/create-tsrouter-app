import { useMemo } from 'react'
import { FileText, Folder } from 'lucide-react'

import { TreeView } from './ui/tree-view'

import type { FileTreeItem } from '../types'

export default function FileTree({
  selectedFile,
  tree,
}: {
  selectedFile: string | null
  tree: Array<FileTreeItem>
}) {
  const initialExpandedItemIds = useMemo(
    () => [
      'src',
      'src/routes',
      'src/components',
      'src/components/ui',
      'src/lib',
    ],
    [],
  )

  return (
    <TreeView
      initialSelectedItemId={selectedFile?.replace('./', '') ?? undefined}
      initialExpandedItemIds={initialExpandedItemIds}
      data={tree}
      defaultNodeIcon={() => <Folder className="w-4 h-4 mr-2" />}
      defaultLeafIcon={() => <FileText className="w-4 h-4 mr-2" />}
    />
  )
}
