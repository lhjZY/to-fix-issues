import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/health', (c) => {
  return c.json({ ok: true })
})

serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`)
})
