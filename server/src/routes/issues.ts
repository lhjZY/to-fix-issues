import { zValidator } from '@hono/zod-validator'
import { UpdateIssueInputSchema, type ApiError, type Issue } from '@raven/shared'
import { and, eq, inArray } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { db } from '../db/client.ts'
import { issueLabels, issues, labels, projects } from '../db/schema.ts'
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

      const { labelIds, ...fields } = input
      await db.transaction(async (tx) => {
        if (labelIds !== undefined) {
          // 先确认所有标签都存在，避免部分关联写入成功。
          if (labelIds.length > 0) {
            const existing = await tx.select().from(labels).where(inArray(labels.id, labelIds))
            if (existing.length !== labelIds.length) {
              throw new HTTPException(400, { message: '标签不存在' })
            }
          }
          await tx.delete(issueLabels).where(eq(issueLabels.issueId, row.id))
          if (labelIds.length > 0) {
            await tx
              .insert(issueLabels)
              .values(labelIds.map((labelId) => ({ issueId: row.id, labelId })))
          }
        }
        // labelIds 属于关联表，不能直接写入 issues。
        await tx
          .update(issues)
          .set({ ...fields, updatedAt: new Date().toISOString() })
          .where(eq(issues.id, row.id))
      })

      // 重新查一次，返回修改后的完整数据（包括负责人和标签）
      const { project, row: updated } = await findIssue(identifier)
      const result: Issue = toIssue(updated, project.key)
      return c.json(result)
    },
  )
