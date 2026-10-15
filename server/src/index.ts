import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { APP_NAME } from '@raven/shared'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ ok: true })
})

serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`${APP_NAME} API listening on http://localhost:${info.port}`)
})
