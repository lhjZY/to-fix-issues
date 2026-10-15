import type { Issue } from '@raven/shared'
import { PriorityIcon } from './PriorityIcon'
import { StatusIcon } from './StatusIcon'

type IssueRowProps = {
  issue: Issue
}

export function IssueRow({ issue }: IssueRowProps) {
  return (
    <div className="flex h-11 cursor-pointer items-center gap-3 px-6 hover:bg-surface">
      <PriorityIcon priority={issue.priority} />
      <span className="w-12 shrink-0 text-fg-subtle">{issue.identifier}</span>
      <StatusIcon status={issue.status} />
      <span className="truncate">{issue.title}</span>
    </div>
  )
}
