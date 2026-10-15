import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { APP_NAME } from '@raven/shared'
import { sql } from 'drizzle-orm'
import { db } from './db/client.ts'
import { projectsRoute } from './routes/projects.ts'

const app = new Hono()

app.get('/api/health', async (c) => {
  await db.run(sql`select 1`)
  return c.json({ ok: true, db: 'ok' })
})

app.route('/api/projects', projectsRoute)
serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`${APP_NAME} API listening on http://localhost:${info.port}`)
})
