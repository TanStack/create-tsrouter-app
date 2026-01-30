import { useState } from 'react'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

import { useAddOns, useApplicationMode } from '../../store/project'
import useStreamingStatus from '../../hooks/use-streaming-status'
import StatusList from '../status-list'
import { addToAppStreaming, shutdown } from '../../lib/api'

export default function RunAddOns() {
  const { chosenAddOns } = useAddOns()
  const [isRunning, setIsRunning] = useState(false)
  const { streamItems, monitorStream, finished } = useStreamingStatus()

  const mode = useApplicationMode()

  if (mode !== 'add') {
    return null
  }

  async function onAddToApp() {
    setIsRunning(true)
    monitorStream(await addToAppStreaming(chosenAddOns))
  }

  return (
    <div>
      <Dialog open={isRunning}>
        <DialogContent
          className="sm:min-w-[425px] sm:max-w-fit"
          hideCloseButton
        >
          <DialogHeader>
            <DialogTitle>Adding Add-Ons</DialogTitle>
          </DialogHeader>
          <StatusList streamItems={streamItems} finished={finished} />
          <DialogFooter>
            <Button
              variant="default"
              onClick={async () => {
                await shutdown()
                window.close()
              }}
              disabled={!finished}
            >
              Exit This Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-2">
        <Button
          variant="default"
          onClick={onAddToApp}
          disabled={chosenAddOns.length === 0 || isRunning}
          className="w-full"
        >
          Add These Add-Ons To Your App
        </Button>
      </div>
    </div>
  )
}
