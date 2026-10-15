import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.ts'

// 数据库文件固定在 server/data/raven.db，不受启动命令所在目录的影响
const dbUrl = new URL('../../data/raven.db', import.meta.url).href

const client = createClient({ url: dbUrl })

// SQLite 默认不检查外键约束，需要手动开启
await client.execute('PRAGMA foreign_keys = ON')

export const db = drizzle(client, { schema })
