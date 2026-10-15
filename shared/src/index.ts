export const APP_NAME = 'Raven'

// 数组顺序就是列表页的分组顺序
export const ISSUE_STATUSES = ['in_progress', 'todo', 'backlog', 'done', 'canceled'] as const

export type IssueStatus = (typeof ISSUE_STATUSES)[number]

// 0 无 / 1 Urgent / 2 High / 3 Medium / 4 Low
export type IssuePriority = 0 | 1 | 2 | 3 | 4

export type User = {
  id: number
  name: string
  avatarUrl: string | null
}

export type Label = {
  id: number
  name: string
  color: string
}

export type Issue = {
  id: number
  identifier: string // 如 'TJ-36'
  title: string
  description: string // Markdown
  status: IssueStatus
  priority: IssuePriority
  assignee: User | null
  labels: Label[]
  createdAt: string // ISO 8601 字符串
  updatedAt: string
}
