import type { Issue } from '@raven/shared'
import type { issues, labels, users } from '../db/schema.ts'

type IssueWithRelations = typeof issues.$inferSelect & {
  assignee: typeof users.$inferSelect | null
  issueLabels: { label: typeof labels.$inferSelect }[]
}

export function toIssue(row: IssueWithRelations, projectKey: string): Issue {
  return {
    id: row.id,
    identifier: `${projectKey}-${row.number}`,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee: row.assignee,
    labels: row.issueLabels.map((item) => item.label),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}
