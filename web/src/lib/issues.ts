import type { Issue, IssueStatus } from '@raven/shared'
// Record<键的类型, 值的类型>
export function groupByStatus(issues: Issue[]): Record<IssueStatus, Issue[]> {
  const groups: Record<IssueStatus, Issue[]> = {
    in_progress: [],
    todo: [],
    backlog: [],
    done: [],
    canceled: [],
  }
  for (const issue of issues) {
    groups[issue.status].push(issue)
  }
  return groups
}
