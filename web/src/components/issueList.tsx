import { type Issue, ISSUE_STATUSES } from '@raven/shared'
import { IssueGroup } from './IssueGroup'
import { groupByStatus } from '../lib/issues'

type IssueListProps = {
  issues: Issue[]
}

export function IssueList({ issues }: IssueListProps) {
  const groups = groupByStatus(issues)

  return (
    <div className="flex flex-col gap-2 py-2">
      {ISSUE_STATUSES.map((status) => {
        const groupIssues = groups[status]
        if (groupIssues.length === 0) {
          return null
        }
        return <IssueGroup key={status} status={status} issues={groupIssues} />
      })}
    </div>
  )
}
