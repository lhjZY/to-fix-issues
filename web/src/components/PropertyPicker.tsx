import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from './ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover.tsx'

type PropertyPickerProps = {
  label: string
  children: ReactNode
  options: {
    value: string
    label: string
    icon: ReactNode
    selected: boolean
    onSelect: () => void
  }[]
  disabled: boolean
  onOpen: () => void
}

// 只负责选择器交互，选项含义和保存请求由调用方决定。
export function PropertyPicker({
  label,
  children,
  options,
  disabled,
  onOpen,
}: PropertyPickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpen()
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-h-8 w-full justify-start gap-2.5 px-2"
          aria-label={`修改${label}`}
          disabled={disabled}
        >
          {children}
          <ChevronDown data-icon="inline-end" className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" aria-label={`选择${label}`}>
        <Command>
          <CommandInput placeholder={`搜索${label}…`} aria-label={`搜索${label}`} />
          <CommandList>
            <CommandEmpty>没有匹配的选项。</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  data-checked={option.selected}
                  disabled={disabled}
                  onSelect={() => {
                    if (disabled) return
                    setOpen(false)
                    option.onSelect()
                  }}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {option.selected && <span className="sr-only">已选择</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
