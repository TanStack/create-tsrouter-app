import { useState } from 'react'
import { toast } from 'sonner'
import { TicketPlusIcon } from 'lucide-react'

import { addCustomAddOn, useAddOns, useRouterMode } from '../store/project'
import { loadRemoteAddOn } from '../lib/api'

import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export default function CustomAddOnDialog() {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)

  const mode = useRouterMode()
  const { toggleAddOn } = useAddOns()

  async function onImport() {
    const data = await loadRemoteAddOn(url)

    if ('error' in data) {
      toast.error('Failed to load add-on', {
        description: data.error,
      })
    } else {
      addCustomAddOn(data)
      if (data.modes.includes(mode)) {
        toggleAddOn(data.id)
      }
      setOpen(false)
    }
  }

  return (
    <div>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          setUrl('')
          setOpen(true)
        }}
      >
        <TicketPlusIcon className="w-4 h-4" />
        Import Custom Add-On
      </Button>
      <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:min-w-[425px] sm:max-w-fit">
          <DialogHeader>
            <DialogTitle>Import Custom Add-On</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/myorg/myproject/add-on.json"
              className="min-w-lg w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onImport()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button onClick={onImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
