import type { Issue } from '@raven/shared'
import { asc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../db/client.ts'
import { issues, projects } from '../db/schema.ts'
import { toIssue } from '../lib/to-issue.ts'

// 挂载在 /api/projects 下，所以这里的路径都是相对路径
export const projectsRoute = new Hono()

// GET /api/projects/:key/issues：项目下的全部 issue
projectsRoute.get('/:key/issues', async (c) => {
  const key = c.req.param('key')

  const project = await db.query.projects.findFirst({
    where: eq(projects.key, key),
  })
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
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
