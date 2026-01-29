import { ChevronDownIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Label } from './ui/label'

import type { AddOnSelectOption } from '@tanstack/create'

interface AddOnOptionSelectProps {
  option: AddOnSelectOption
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function AddOnOptionSelect({
  option,
  value,
  onChange,
  disabled = false,
}: AddOnOptionSelectProps) {
  const selectedOption = option.options.find((opt: { value: string; label: string }) => opt.value === value)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-300">
        {option.label}
      </Label>
      {option.description && (
        <p className="text-xs text-gray-500">{option.description}</p>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            <span>{selectedOption?.label || 'Select option...'}</span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {option.options.map((opt: { value: string; label: string }) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={value === opt.value ? 'bg-accent' : ''}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}