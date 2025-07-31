import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

import AddOnOptionsPanel from './add-on-options-panel'

import type { AddOnInfo } from '../types'

interface AddOnConfigDialogProps {
  addOn: AddOnInfo | undefined
  selectedOptions: Record<string, any>
  onOptionChange: (optionName: string, value: any) => void
  onClose: () => void
  disabled?: boolean
}

export default function AddOnConfigDialog({
  addOn,
  selectedOptions,
  onOptionChange,
  onClose,
  disabled = false,
}: AddOnConfigDialogProps) {
  if (!addOn) return null

  return (
    <Dialog open={!!addOn} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {addOn.name}</DialogTitle>
          <DialogDescription>
            Customize the configuration options for this add-on.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <AddOnOptionsPanel
            addOn={addOn}
            selectedOptions={selectedOptions}
            onOptionChange={onOptionChange}
            disabled={disabled}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}