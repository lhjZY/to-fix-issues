import { serve } from '@hono/node-server'
import { APP_NAME } from '@raven/shared'
import app from './app.ts'

serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`${APP_NAME} API listening on http://localhost:${info.port}`)
})
