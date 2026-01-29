import { useState } from 'react'
import { HammerIcon } from 'lucide-react'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

import useStreamingStatus from '../../hooks/use-streaming-status'
import {
  useAddOns,
  useApplicationMode,
  useProjectOptions,
  useProjectStarter,
} from '../../store/project'
import StatusList from '../status-list'
import { createAppStreaming, shutdown } from '../../lib/api'


export default function RunCreateApp() {
  const [isRunning, setIsRunning] = useState(false)
  const { streamItems, monitorStream, finished } = useStreamingStatus()

  const mode = useApplicationMode()
  const options = useProjectOptions()
  const { chosenAddOns } = useAddOns()
  const { projectStarter } = useProjectStarter()

  if (mode !== 'setup') {
    return null
  }

  async function onAddToApp() {
    setIsRunning(true)
    monitorStream(
      await createAppStreaming(options, chosenAddOns, projectStarter),
    )
  }

  return (
    <div>
      <Dialog open={isRunning}>
        <DialogContent
          className="sm:min-w-[425px] sm:max-w-fit"
          hideCloseButton
        >
          <DialogHeader>
            <DialogTitle>Creating Your Application</DialogTitle>
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
          disabled={isRunning}
          className="w-full"
        >
          <HammerIcon className="w-4 h-4" />
          Build Your App
        </Button>
      </div>
    </div>
  )
}
