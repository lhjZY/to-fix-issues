// 写入开发用的示例数据：npm run db:seed
// 每次执行都会先清空所有数据，再重新写入，所以可以反复执行

import { sql } from 'drizzle-orm'
import { db } from './client.ts'
import { issueLabels, issues, labels, projects, users } from './schema.ts'

await db.transaction(async (tx) => {
  // 1. 清空旧数据（先删依赖别人的表，再删被依赖的表）
  await tx.delete(issueLabels)
  await tx.delete(issues)
  await tx.delete(labels)
  await tx.delete(users)
  await tx.delete(projects)
  // 重置自增 id，让每次 seed 后的 id 都从 1 开始
  await tx.run(sql`delete from sqlite_sequence`)

  // 2. 写入项目、用户、标签
  const [project] = await tx
    .insert(projects)
    .values({ key: 'TJ', name: 'TJ-翻译器', issueCounter: 36 })
    .returning()

  const [allen] = await tx.insert(users).values({ name: 'Allen' }).returning()

  const [feature] = await tx
    .insert(labels)
    .values({ name: 'Feature', color: '#bb87fc' })
    .returning()

  // 3. 写入 issue
  const seedIssues = [
    {
      number: 30,
      title: '划词翻译：选中后弹出图标，点击再翻译',
      status: 'in_progress',
      priority: 0,
      assigneeId: allen.id,
      labelIds: [feature.id],
      createdAt: '2026-09-14T08:30:00.000Z',
    },
    {
      number: 36,
      title: 'AI 翻译 API 接入与 Provider 架构',
      description:
        '## 目标\n\n建立统一的翻译引擎接入层，让 Google 翻译、硅基流动和腾讯混元翻译模型可以在同一套设置、测试和翻译流程中工作。',
      status: 'todo',
      priority: 2,
      assigneeId: null,
      labelIds: [],
      createdAt: '2026-09-14T09:36:00.000Z',
    },
    {
      number: 35,
      title: '翻译中心：独立输入、历史与收藏',
      status: 'todo',
      priority: 3,
      assigneeId: null,
      labelIds: [],
      createdAt: '2026-09-14T09:35:00.000Z',
    },
    {
      number: 34,
      title: '快捷键体系：选区翻译、弹窗操作与翻译中心',
      status: 'todo',
      priority: 4,
      assigneeId: null,
      labelIds: [],
      createdAt: '2026-09-14T09:34:00.000Z',
    },
    {
      number: 33,
      title: '翻译框 popup UI 优化',
      status: 'todo',
      priority: 0,
      assigneeId: null,
      labelIds: [],
      createdAt: '2026-09-14T09:33:00.000Z',
    },
    {
      number: 31,
      title: '点击工具栏图标从侧边栏打开设置',
      status: 'todo',
      priority: 0,
      assigneeId: allen.id,
      labelIds: [feature.id],
      createdAt: '2026-09-14T09:31:00.000Z',
    },
    {
      number: 32,
      title: '第一版翻译引擎默认 Google，不接 AI',
      status: 'done',
      priority: 0,
      assigneeId: allen.id,
      labelIds: [feature.id],
      createdAt: '2026-09-14T09:32:00.000Z',
    },
    {
      number: 29,
      title: '产品 Icon 与配色主题',
      status: 'done',
      priority: 0,
      assigneeId: allen.id,
      labelIds: [feature.id],
      createdAt: '2026-09-14T09:29:00.000Z',
    },
  ] as const

  // 数组下标作为 sort_order：同一分组内按这里的顺序显示
  for (const [index, item] of seedIssues.entries()) {
    const [issue] = await tx
      .insert(issues)
      .values({
        projectId: project.id,
        number: item.number,
        title: item.title,
        description: 'description' in item ? item.description : '',
        status: item.status,
        priority: item.priority,
        assigneeId: item.assigneeId,
        sortOrder: index,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      })
      .returning()

    for (const labelId of item.labelIds) {
      await tx.insert(issueLabels).values({ issueId: issue.id, labelId })
    }
  }
})

console.log('✓ seed 完成')
