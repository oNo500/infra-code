import { Hono } from 'hono'
import { logger } from 'hono/logger'

import { env } from './env'
import { health } from './routes/health'

const app = new Hono()

app.use('*', logger())
app.route('/', health)

export default {
  port: env.PORT,
  fetch: app.fetch,
}
