import { Dialog, DialogContent } from './ui/dialog'

import type { AddOnInfo } from '../types'

export default function CustomAddOnDialog({
  addOn,
  onClose,
}: {
  addOn?: AddOnInfo
  onClose: () => void
}) {
  return (
    <Dialog modal open={!!addOn} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-[425px] sm:max-w-fit">
        <div className="flex flex-row">
          {addOn?.smallLogo && (
            <img
              src={`data:image/svg+xml,${encodeURIComponent(addOn.smallLogo)}`}
              alt={addOn.name}
              className="w-15"
            />
          )}
          <div className="flex flex-col ml-4 gap-4">
            <p className="text-lg font-bold">{addOn?.name}</p>
            <p className="text-sm text-gray-500">{addOn?.description}</p>
            <a
              href={addOn?.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 underline"
            >
              More information on {addOn?.name}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
