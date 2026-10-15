import { serve } from '@hono/node-server'
import { APP_NAME, type ApiError } from '@raven/shared'
import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { db } from './db/client.ts'
import { issuesRoute } from './routes/issues.ts'
import { projectsRoute } from './routes/projects.ts'

const app = new Hono()

app.get('/api/health', async (c) => {
  // 执行一条最简单的查询，确认数据库可以连接
  await db.run(sql`select 1`)
  return c.json({ ok: true, db: 'ok' })
})

app.route('/api/projects', projectsRoute)
app.route('/api/issues', issuesRoute)

// 没有匹配到任何路由
app.notFound((c) => {
  return c.json<ApiError>({ error: 'Not Found' }, 404)
})

// 处理函数中抛出的所有错误都会到这里
app.onError((err, c) => {
  // 主动抛出的 HTTPException：使用它自带的状态码和信息
  if (err instanceof HTTPException) {
    return c.json<ApiError>({ error: err.message }, err.status)
  }
  // 其他意料之外的错误：在服务端打印详情，只告诉前端"服务器出错了"
  console.error(err)
  return c.json<ApiError>({ error: 'Internal Server Error' }, 500)
})

serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`${APP_NAME} API listening on http://localhost:${info.port}`)
})
