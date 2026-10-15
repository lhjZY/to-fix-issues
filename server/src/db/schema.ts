import { ISSUE_STATUSES, type IssuePriority } from '@raven/shared'
import { sql } from 'drizzle-orm'
import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

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
