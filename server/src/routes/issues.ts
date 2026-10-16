import { zValidator } from '@hono/zod-validator'
import { UpdateIssueInputSchema, type ApiError, type Issue } from '@raven/shared'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { db } from '../db/client.ts'
import { issues, projects } from '../db/schema.ts'
import { parseIdentifier } from '../lib/identifier.ts'
import { toIssue } from '../lib/to-issue.ts'

// 根据 'TJ-36' 这样的编号找到 issue（连同负责人和标签），找不到就抛出 404
async function findIssue(identifier: string) {
  const parsed = parseIdentifier(identifier)
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

  return { project, row }
}

// 挂载在 /api/issues 下
export const issuesRoute = new Hono()
  // GET /api/issues/:identifier：单条 issue 详情，如 /api/issues/TJ-36
  .get('/:identifier', async (c) => {
    const { project, row } = await findIssue(c.req.param('identifier'))

    const result: Issue = toIssue(row, project.key)
    return c.json(result)
  })

  // PATCH /api/issues/:identifier：修改 issue，只需要传要改的字段
  .patch(
    '/:identifier',
    zValidator('json', UpdateIssueInputSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: z.prettifyError(result.error) } satisfies ApiError, 400)
      }
    }),
    async (c) => {
      const identifier = c.req.param('identifier')
      const input = c.req.valid('json')

      const { row } = await findIssue(identifier)

      await db
        .update(issues)
        // input 里只有传了的字段；没传的字段不会出现在 SQL 里，保持原值
        .set({ ...input, updatedAt: new Date().toISOString() })
        .where(eq(issues.id, row.id))

      // 重新查一次，返回修改后的完整数据（包括负责人和标签）
      const { project, row: updated } = await findIssue(identifier)
      const result: Issue = toIssue(updated, project.key)
      return c.json(result)
    },
  )
