import { useState } from 'react'
import { FileBoxIcon, TrashIcon } from 'lucide-react'

import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  setProjectStarter,
  useApplicationMode,
  useProjectStarter,
  useRegistry,
} from '../../store/project'
import { loadRemoteStarter } from '../../lib/api'
import { StartersCarousel } from '../starters-carousel'

export default function Starter() {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)

  const mode = useApplicationMode()

  const { projectStarter } = useProjectStarter()

  if (mode !== 'setup') {
    return null
  }

  async function onImport(registryUrl?: string) {
    const data = await loadRemoteStarter(registryUrl || url)

    if ('error' in data) {
      toast.error('Failed to load starter', {
        description: data.error,
      })
    } else {
      setProjectStarter(data)
      setOpen(false)
    }
  }

  const registry = useRegistry()

  return (
    <>
      {projectStarter?.banner && (
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-gray-300 rounded-lg shadow-xl shadow-gray-800">
            <img
              src={projectStarter.banner}
              alt="Starter Banner"
              className="w-40 max-w-full"
            />
          </div>
        </div>
      )}
      {projectStarter?.name && (
        <div className="text-md mb-4">
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={() => {
              setProjectStarter(undefined)
            }}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
          <span className="font-bold">Starter: </span>
          {projectStarter.name}
        </div>
      )}
      <div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            setUrl('')
            setOpen(true)
          }}
        >
          <FileBoxIcon className="w-4 h-4" />
          Set Project Starter
        </Button>
        <Dialog modal open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:min-w-[425px] sm:max-w-fit">
            <DialogHeader>
              <DialogTitle>Project Starter URL</DialogTitle>
            </DialogHeader>
            {registry?.starters && (
              <div>
                <StartersCarousel onImport={(url) => onImport(url)} />
              </div>
            )}
            <div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/myorg/myproject/starter.json"
                className="min-w-lg w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onImport()
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => onImport()}>Load</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
