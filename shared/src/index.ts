import { z } from 'zod'
export const APP_NAME = 'Raven'

// 数组顺序就是列表页的分组顺序
export const ISSUE_STATUSES = ['in_progress', 'todo', 'backlog', 'done', 'canceled'] as const

export const IssueStatusSchema = z.enum(ISSUE_STATUSES)
export type IssueStatus = z.infer<typeof IssueStatusSchema>

export const STATUS_LABEL: Record<IssueStatus, string> = {
  in_progress: 'In Progress',
  todo: 'Todo',
  backlog: 'Backlog',
  done: 'Done',
  canceled: 'Canceled',
}

// 0 无 / 1 Urgent / 2 High / 3 Medium / 4 Low

export const IssuePrioritySchema = z.literal([0, 1, 2, 3, 4])
export type IssuePriority = z.infer<typeof IssuePrioritySchema>

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
  0: 'No priority',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
}

// ---------------------------------------------------------------------------
// 数据结构：先定义 schema，再用 z.infer 推导出 TS 类型
// ---------------------------------------------------------------------------

export const ProjectSchema = z.object({
  id: z.number(),
  key: z.string(),
  name: z.string(),
})
export type Project = z.infer<typeof ProjectSchema>

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
})
export type User = z.infer<typeof UserSchema>

export const LabelSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
})
export type Label = z.infer<typeof LabelSchema>

export const IssueSchema = z.object({
  id: z.number(),
  identifier: z.string(), // 如 'TJ-36'
  title: z.string(),
  description: z.string(), // Markdown
  status: IssueStatusSchema,
  priority: IssuePrioritySchema,
  assignee: UserSchema.nullable(),
  labels: z.array(LabelSchema),
  createdAt: z.iso.datetime(), // ISO 8601 字符串
  updatedAt: z.iso.datetime(),
})
export type Issue = z.infer<typeof IssueSchema>

// ---------------------------------------------------------------------------
// 请求体：新建 issue
// ---------------------------------------------------------------------------

const IssueTitleSchema = z.string().trim().min(1, '标题不能为空').max(200, '标题不能超过200个字符')

export const CreateIssueInputSchema = z.object({
  // trim()：去掉首尾空格后再检查长度，全是空格的标题也不允许
  title: IssueTitleSchema,
  description: z.string().default(''),
  status: IssueStatusSchema.default('todo'),
  priority: IssuePrioritySchema.default(0),
})
// z.input：调用方需要传入的结构（带默认值的字段可以不传）
export type CreateIssueInput = z.input<typeof CreateIssueInputSchema>

// 修改时只传要改的字段，所以每个字段都是可选的（.partial()），并且没有默认值
export const UpdateIssueInputSchema = z
  .object({
    title: IssueTitleSchema,
    description: z.string(),
    status: IssueStatusSchema,
    priority: IssuePrioritySchema,
    labelIds: z
      .array(z.number().int().positive())
      .refine((ids) => new Set(ids).size === ids.length, '标签不能重复'),
  })
  .partial()
  .refine((input) => Object.keys(input).length > 0, '至少需要修改一个字段')
export type UpdateIssueInput = z.input<typeof UpdateIssueInputSchema>

// ---------------------------------------------------------------------------
// 接口出错时统一返回的结构
// ---------------------------------------------------------------------------

export type ApiError = {
  error: string
}
