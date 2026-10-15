import type { Issue } from '@raven/shared'
import { PriorityIcon } from './PriorityIcon'
import { StatusIcon } from './StatusIcon'
import { LabelChip } from './LabelChip'
import { Avatar } from './Avatar'
import { formatShortDate } from '../lib/format'
import { Link } from 'react-router'

type IssueRowProps = {
  issue: Issue
}

export function IssueRow({ issue }: IssueRowProps) {
  return (
    <Link
      to={`/issue/${issue.identifier}`}
      className="flex h-11 items-center gap-3 px-6 hover:bg-surface"
    >
      <PriorityIcon priority={issue.priority} />
      <span className="w-12 shrink-0 text-fg-subtle">{issue.identifier}</span>
      <StatusIcon status={issue.status} />
      <span className="min-w-0 flex-1 truncate">{issue.title}</span>

      <div className="flex shrink-0 items-center gap-3">
        {issue.labels.map((label) => (
          <LabelChip key={label.id} label={label} />
        ))}
        <Avatar user={issue.assignee} />
        <span className="w-12 text-right text-fg-subtle">{formatShortDate(issue.createdAt)}</span>
      </div>
    </Link>
  )
}
