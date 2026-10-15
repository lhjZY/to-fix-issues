import type { Issue } from '@raven/shared'
import { asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
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
