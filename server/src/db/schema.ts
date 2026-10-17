import { ISSUE_STATUSES, type IssuePriority } from '@raven/shared'
import { relations, sql } from 'drizzle-orm'
import { integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// 当前时间的 ISO 8601 字符串，如 '2026-09-14T08:30:00.000Z'，和 API 中的时间格式一致
const nowIso = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(), // 'TJ'
  name: text('name').notNull(), // 'TJ-翻译器'
  // 每新建一个 issue 加 1，作为新 issue 的编号
  issueCounter: integer('issue_counter').notNull().default(0),
})

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
})

export const issues = sqliteTable(
  'issues',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    number: integer('number').notNull(), // TJ-36 中的 36
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status', { enum: ISSUE_STATUSES }).notNull().default('todo'),
    priority: integer('priority').$type<IssuePriority>().notNull().default(0),
    assigneeId: integer('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    sortOrder: real('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull().default(nowIso),
    updatedAt: text('updated_at').notNull().default(nowIso),
  },
  // 同一个项目内，编号不能重复
  (table) => [uniqueIndex('issues_project_number_unique').on(table.projectId, table.number)],
)

export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // 'Feature'
  color: text('color').notNull(), // '#bb87fc'
})

// 关联表：一行表示"某个 issue 打上了某个标签"
export const issueLabels = sqliteTable(
  'issue_labels',
  {
    issueId: integer('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade' }),
    labelId: integer('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  // 联合主键：同一个 issue 不能重复打同一个标签
  (table) => [primaryKey({ columns: [table.issueId, table.labelId] })],
)

// 图片本身保存在磁盘，这张表只记录它属于哪个 issue 以及文件信息。
export const attachments = sqliteTable('attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  issueId: integer('issue_id')
    .notNull()
    .references(() => issues.id, { onDelete: 'cascade' }),
  path: text('path').notNull().unique(), // 服务端生成的文件名，不接受用户提供的路径
  mime: text('mime').notNull(),
  size: integer('size').notNull(),
  createdAt: text('created_at').notNull().default(nowIso),
})

// ---------------------------------------------------------------------------
// 关系定义：只给 Drizzle 的查询 API 使用，不会改变数据库结构
// ---------------------------------------------------------------------------

export const projectsRelations = relations(projects, ({ many }) => ({
  issues: many(issues),
}))

export const usersRelations = relations(users, ({ many }) => ({
  assignedIssues: many(issues),
}))

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, { fields: [issues.projectId], references: [projects.id] }),
  assignee: one(users, { fields: [issues.assigneeId], references: [users.id] }),
  issueLabels: many(issueLabels),
}))

export const labelsRelations = relations(labels, ({ many }) => ({
  issueLabels: many(issueLabels),
}))

export const issueLabelsRelations = relations(issueLabels, ({ one }) => ({
  issue: one(issues, { fields: [issueLabels.issueId], references: [issues.id] }),
  label: one(labels, { fields: [issueLabels.labelId], references: [labels.id] }),
}))
