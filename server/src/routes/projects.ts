import { zValidator } from '@hono/zod-validator'
import { CreateIssueInputSchema, type ApiError, type Issue } from '@raven/shared'
import { asc, eq, min, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { db } from '../db/client.ts'
import { issues, projects } from '../db/schema.ts'
import { toIssue } from '../lib/to-issue.ts'

// 挂载在 /api/projects 下，所以这里的路径都是相对路径
// 用链式写法 new Hono().get(...)，路由信息才会保留在类型里，供前端 hc 客户端推导
export const projectsRoute = new Hono()
  // GET /api/projects/:key/issues：项目下的全部 issue
  .get('/:key/issues', async (c) => {
    const key = c.req.param('key')

    const project = await db.query.projects.findFirst({
      where: eq(projects.key, key),
    })
    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }

    const rows = await db.query.issues.findMany({
      where: eq(issues.projectId, project.id),
      with: {
        assignee: true,
        issueLabels: { with: { label: true } },
      },
      orderBy: [asc(issues.sortOrder)],
    })

    const result: Issue[] = rows.map((row) => toIssue(row, project.key))
    return c.json(result)
  })

  // POST /api/projects/:key/issues：新建 issue
  .post(
    '/:key/issues',
    // 先用 zod 校验请求体，不通过就直接返回 400，不会进入下面的处理函数
    zValidator('json', CreateIssueInputSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: z.prettifyError(result.error) } satisfies ApiError, 400)
      }
    }),
    async (c) => {
      const key = c.req.param('key')
      // 校验通过后的数据，默认值已经填好
      const input = c.req.valid('json')

      const project = await db.query.projects.findFirst({
        where: eq(projects.key, key),
      })
      if (!project) {
        throw new HTTPException(404, { message: 'Project not found' })
      }

      // 编号自增和插入 issue 必须在同一个事务里，要么都成功，要么都不生效
      const row = await db.transaction(async (tx) => {
        // 1. 在数据库里直接执行 issue_counter = issue_counter + 1，并拿回新值
        const [updated] = await tx
          .update(projects)
          .set({ issueCounter: sql`${projects.issueCounter} + 1` })
          .where(eq(projects.id, project.id))
          .returning({ issueCounter: projects.issueCounter })

        // 2. 新 issue 排在最前面：sort_order 比当前最小值再小 1
        const [{ minSortOrder }] = await tx
          .select({ minSortOrder: min(issues.sortOrder) })
          .from(issues)
          .where(eq(issues.projectId, project.id))

        // 3. 插入 issue
        const [inserted] = await tx
          .insert(issues)
          .values({
            projectId: project.id,
            number: updated.issueCounter,
            title: input.title,
            description: input.description,
            status: input.status,
            priority: input.priority,
            sortOrder: (minSortOrder ?? 0) - 1,
          })
          .returning()

        return inserted
      })

      // 新建的 issue 还没有负责人和标签
      const result: Issue = toIssue({ ...row, assignee: null, issueLabels: [] }, project.key)
      // 201 Created：表示新建成功
      return c.json(result, 201)
    },
  )
