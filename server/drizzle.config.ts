import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle', // 生成的迁移 SQL 放在这里
  dbCredentials: {
    url: 'file:data/raven.db',
  },
})
