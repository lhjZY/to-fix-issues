import type { Issue } from '@raven/shared'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from '../db/client.ts'
import { issues, projects } from '../db/schema.ts'
import { parseIdentifier } from '../lib/identifier.ts'
import { toIssue } from '../lib/to-issue.ts'

// 挂载在 /api/issues 下
export const issuesRoute = new Hono()

// GET /api/issues/:identifier：单条 issue 详情，如 /api/issues/TJ-36
issuesRoute.get('/:identifier', async (c) => {
  const parsed = parseIdentifier(c.req.param('identifier'))
  if (!parsed) {
    throw new HTTPException(404, { message: 'Issue not found' })
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.key, parsed.projectKey),
  })
  if (!project) {
    throw new HTTPException(404, { message: 'Issue not found' })
  }

  const row = await db.query.issues.findFirst({
    where: and(eq(issues.projectId, project.id), eq(issues.number, parsed.number)),
    with: {
      assignee: true,
      issueLabels: { with: { label: true } },
    },
  })
  if (!row) {
    throw new HTTPException(404, { message: 'Issue not found' })
  }

  const result: Issue = toIssue(row, project.key)
  return c.json(result)
})
