import { ISSUE_STATUSES, STATUS_LABEL, type Issue } from '@raven/shared'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useUpdateIssue } from '../hooks/useUpdateIssue.ts'
import { StatusIcon } from './StatusIcon.tsx'
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

type StatusPickerProps = {
  issue: Issue
  projectKey: string
}

export function StatusPicker({ issue, projectKey }: StatusPickerProps) {
  const [open, setOpen] = useState(false)
  const updateIssue = useUpdateIssue(issue.identifier, projectKey)

  return (
    <div>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) updateIssue.reset()
          setOpen(nextOpen)
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2.5 px-2"
            aria-label={`修改状态，当前为 ${STATUS_LABEL[issue.status]}`}
            disabled={updateIssue.isPending}
          >
            <span className="flex size-5 items-center justify-center">
              <StatusIcon status={issue.status} />
            </span>
            <span>{STATUS_LABEL[issue.status]}</span>
            <ChevronDown data-icon="inline-end" className="ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-60 p-0" aria-label="选择状态">
          <Command>
            <CommandInput placeholder="搜索状态…" aria-label="搜索状态" />
            <CommandList>
              <CommandEmpty>没有匹配的状态。</CommandEmpty>
              <CommandGroup>
                {ISSUE_STATUSES.map((status) => (
                  <CommandItem
                    key={status}
                    value={status}
                    keywords={[STATUS_LABEL[status]]}
                    data-checked={status === issue.status}
                    disabled={updateIssue.isPending}
                    onSelect={() => {
                      if (updateIssue.isPending) return
                      setOpen(false)
                      if (status !== issue.status) {
                        updateIssue.mutate({ status })
                      }
                    }}
                  >
                    <StatusIcon status={status} />
                    <span>{STATUS_LABEL[status]}</span>
                    {status === issue.status && <span className="sr-only">当前状态</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {updateIssue.isPending && (
        <p role="status" className="mt-1 px-2 text-xs text-fg-muted">
          保存中…
        </p>
      )}
      {updateIssue.isError && (
        <p role="alert" className="mt-1 px-2 text-xs text-destructive">
          状态保存失败，请重新选择后重试。
        </p>
      )}
    </div>
  )
}
