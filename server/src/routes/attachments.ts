import { zValidator } from '@hono/zod-validator'
import type { ApiError } from '@raven/shared'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { bodyLimit } from 'hono/body-limit'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { db } from '../db/client.ts'
import { attachments, issues, projects } from '../db/schema.ts'
import { parseIdentifier } from '../lib/identifier.ts'

const uploadsDirectory = new URL('../../uploads/', import.meta.url)
const maxFileSize = 5 * 1024 * 1024

// 挂载在 /api/issues 下；一个请求只接收一张图片。
export const attachmentsRoute = new Hono().post(
  '/:identifier/attachments',
  bodyLimit({
    // multipart 还包含字段名、文件名和分隔符，给它们留出空间。
    maxSize: maxFileSize + 1024 * 1024,
    onError: (c) => c.json({ error: '上传请求不能超过 6 MiB' } satisfies ApiError, 413),
  }),
  zValidator('form', z.object({ file: z.instanceof(File) }).strict(), (result, c) => {
    if (!result.success) {
      return c.json({ error: '请通过 file 字段上传一张图片' } satisfies ApiError, 400)
    }
  }),
  async (c) => {
    const file = c.req.valid('form').file
    if (file.size === 0) throw new HTTPException(400, { message: '图片不能为空' })
    if (file.size > maxFileSize) {
      throw new HTTPException(413, { message: '图片不能超过 5 MiB' })
    }

    const parsed = parseIdentifier(c.req.param('identifier'))
    if (!parsed || !Number.isSafeInteger(parsed.number)) {
      throw new HTTPException(404, { message: 'Issue not found' })
    }
    const [issue] = await db
      .select({ id: issues.id })
      .from(issues)
      .innerJoin(projects, eq(issues.projectId, projects.id))
      .where(and(eq(projects.key, parsed.projectKey), eq(issues.number, parsed.number)))
    if (!issue) throw new HTTPException(404, { message: 'Issue not found' })

    const bytes = Buffer.from(await file.arrayBuffer())
    // 文件名和 MIME 都可以伪造，再检查实际文件头；不接受 SVG / HTML。
    const formats = [
      {
        mime: 'image/png',
        extension: 'png',
        matches: bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
      },
      {
        mime: 'image/jpeg',
        extension: 'jpg',
        matches: bytes.subarray(0, 3).toString('hex') === 'ffd8ff',
      },
      {
        mime: 'image/gif',
        extension: 'gif',
        matches: ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii')),
      },
      {
        mime: 'image/webp',
        extension: 'webp',
        matches:
          bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
          bytes.subarray(8, 12).toString('ascii') === 'WEBP',
      },
    ]
    const format = formats.find((candidate) => candidate.matches && candidate.mime === file.type)
    if (!format) {
      throw new HTTPException(415, { message: '仅支持文件类型匹配的 PNG、JPEG、GIF、WebP 图片' })
    }

    const filename = `${randomUUID()}.${format.extension}`
    const fileUrl = new URL(filename, uploadsDirectory)
    await mkdir(uploadsDirectory, { recursive: true })
    await writeFile(fileUrl, bytes, { flag: 'wx' })

    try {
      const [attachment] = await db
        .insert(attachments)
        .values({ issueId: issue.id, path: filename, mime: format.mime, size: file.size })
        .returning()
      return c.json(
        {
          id: attachment.id,
          issueId: attachment.issueId,
          url: `/uploads/${attachment.path}`,
          mime: attachment.mime,
          size: attachment.size,
          createdAt: attachment.createdAt,
        },
        201,
      )
    } catch (error) {
      // 数据库事务无法回滚磁盘文件，记录失败时需要手动清理。
      await unlink(fileUrl).catch((cleanupError) => console.error('清理上传文件失败', cleanupError))
      throw error
    }
  },
)

// 只读取有附件记录的文件，不把整个 server 目录暴露为静态资源。
export const uploadsRoute = new Hono().get('/:filename', async (c) => {
  const filename = c.req.param('filename')
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|gif|webp)$/.test(
      filename,
    )
  ) {
    throw new HTTPException(404, { message: 'Image not found' })
  }
  const attachment = await db.query.attachments.findFirst({ where: eq(attachments.path, filename) })
  if (!attachment) throw new HTTPException(404, { message: 'Image not found' })

  let bytes: Buffer
  try {
    bytes = await readFile(new URL(filename, uploadsDirectory))
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new HTTPException(404, { message: 'Image not found' })
    }
    throw error
  }
  return c.body(new Uint8Array(bytes), 200, {
    'Content-Type': attachment.mime,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
})
