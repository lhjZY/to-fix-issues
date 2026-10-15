import { STATUS_LABEL, type Issue, type IssueStatus } from '@raven/shared'
import { Plus } from 'lucide-react'
import { IssueRow } from './IssueRow.tsx'
import { StatusIcon } from './StatusIcon.tsx'

type IssueGroupProps = {
  status: IssueStatus
  issues: Issue[]
}

export function IssueGroup({ status, issues }: IssueGroupProps) {
  return (
    <section>
      <div className="mx-2 flex h-9 items-center gap-2 rounded-md bg-surface px-4">
        <StatusIcon status={status} />
        <span className="font-medium">{STATUS_LABEL[status]}</span>
        <span className="text-fg-subtle">{issues.length}</span>
        <button
          type="button"
          aria-label="New issue"
          className="ml-auto rounded p-1 text-fg-muted hover:bg-canvas hover:text-fg"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </section>
  )
}
