import { useCallback, useState } from 'react'

import {
  InfoIcon,
  MessageCircleCodeIcon,
  PackageIcon,
  SquarePenIcon,
  TerminalIcon,
} from 'lucide-react'

import type { StatusStepType } from '@tanstack/create'

import type { StreamEvent, StreamItem } from '../types'

const iconMap: Record<StatusStepType, typeof InfoIcon> = {
  file: SquarePenIcon,
  command: TerminalIcon,
  'package-manager': PackageIcon,
  info: InfoIcon,
  other: MessageCircleCodeIcon,
}

export default function useStreamingStatus() {
  const [streamItems, setStreamItems] = useState<Array<StreamItem>>([])
  const [finished, setFinished] = useState(false)

  const monitorStream = useCallback(async (res: Response) => {
    setFinished(false)
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    let rawStream = ''
    while (true) {
      const result = await reader?.read()
      if (result?.done) break

      rawStream += decoder.decode(result?.value)

      let currentId: string | undefined
      const newStreamItems: Array<StreamItem> = []
      for (const line of rawStream.split('\n')) {
        if (line.startsWith('{') && line.endsWith('}')) {
          const item = JSON.parse(line) as StreamEvent
          if (item.msgType === 'start') {
            if (currentId === item.id) {
              newStreamItems[newStreamItems.length - 1].message = item.message
            } else {
              currentId = item.id
              newStreamItems.push({
                id: currentId,
                icon: iconMap[item.type],
                message: item.message,
              })
            }
          } else {
            if (newStreamItems.length > 0) {
              newStreamItems[newStreamItems.length - 1].message = item.message
            }
            currentId = undefined
          }
        }
      }
      setStreamItems(newStreamItems)
    }
    setFinished(true)
    return rawStream
  }, [])

  return { finished, streamItems, monitorStream }
}
