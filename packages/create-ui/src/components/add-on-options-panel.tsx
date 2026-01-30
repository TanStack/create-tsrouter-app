import AddOnOptionSelect from './add-on-option-select'

import type { AddOnInfo } from '../types'

interface AddOnOptionsPanelProps {
  addOn: AddOnInfo
  selectedOptions: Record<string, any>
  onOptionChange: (optionName: string, value: any) => void
  disabled?: boolean
}

export default function AddOnOptionsPanel({
  addOn,
  selectedOptions,
  onOptionChange,
  disabled = false,
}: AddOnOptionsPanelProps) {
  if (!addOn.options || Object.keys(addOn.options).length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {Object.entries(addOn.options).map(([optionName, option]) => {
        if (option && typeof option === 'object' && 'type' in option && option.type === 'select') {
          return (
            <AddOnOptionSelect
              key={optionName}
              option={option as any}
              value={selectedOptions[optionName] || (option as any).default}
              onChange={(value) => onOptionChange(optionName, value)}
              disabled={disabled}
            />
          )
        }
        
        // Future option types can be added here
        return null
      })}
    </div>
  )
}