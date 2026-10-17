# Raven

一个用于学习 React 与 TypeScript 全栈开发的 Issue 管理应用。围绕项目列表、Issue 详情和直接编辑体验，逐步实现从界面交互到数据库持久化的完整流程。

前端使用 React + Vite，后端使用 Hono，通过 npm workspaces 管理共享类型、Web 应用和 API。数据保存在本地 SQLite，上传图片保存在服务器磁盘。

## 当前功能

- **Issue 列表**：按状态分组、折叠分组，展示优先级、编号、标签、负责人和日期。
- **新建 Issue**：弹窗表单、输入校验、项目内编号自增。
- **详情与属性编辑**：修改状态、优先级和标签，支持乐观更新及失败回滚。
- **直接编辑**：标题与描述无需切换编辑模式，停止输入后防抖自动保存，保存请求串行执行。
- **Markdown 描述**：支持标题、列表、任务清单、引用、代码块等；输入 `/` 打开格式菜单，选中文字后可使用浮动工具栏。
- **粘贴图片**：上传剪贴板图片并插入描述，保存为 Markdown 图片链接，刷新后仍可查看。
- **编辑保护**：加载、错误与空状态提示，未保存内容及未完成上传的离开保护。

目前以示例项目 `TJ-翻译器` 为入口。Issue 和标签使用数据库数据，项目导航仍使用固定配置；Inbox、My issues 为占位页。

## 技术栈

| 部分 | 技术 |
| --- | --- |
| 语言 | TypeScript 7 |
| 前端 | React 19、Vite 8、React Router |
| 样式与组件 | Tailwind CSS 4、shadcn/ui、Radix UI、Lucide |
| 请求与缓存 | Hono RPC 客户端、TanStack Query |
| 表单校验 | React Hook Form、Zod |
| 富文本编辑 | Tiptap、`@tiptap/markdown`、Image 扩展 |
| 后端 | Hono、Node.js、tsx |
| 数据库 | SQLite、libSQL 客户端、Drizzle ORM |
| 工程检查 | oxfmt、oxlint、Husky、lint-staged、commitlint |

实际依赖版本以各 workspace 的 `package.json` 和根目录的 `package-lock.json` 为准。

## 快速开始

### 环境

- Node.js 和 npm；当前开发环境为 **Node.js 26.3.0 / npm 11.16.0**。
- Git，用于版本管理及 Husky 提交检查。
- 无需单独安装数据库服务，当前也不需要配置 `.env`。

克隆仓库后，进入包含根 `package.json` 的目录。以下命令均在该目录执行。

### 安装与初始化

```bash
# 根据锁文件安装全部 workspace 依赖，并安装 Git hooks
npm ci

# 执行已有迁移，创建数据库表
npm run db:migrate
```

首次体验时，可以写入示例项目、用户、标签及 8 条 Issue：

**注意：`db:seed` 会清空已有业务数据，再重建示例数据。仅在首次初始化或明确需要重置数据时执行。**

```bash
npm run db:seed
```

### 启动

```bash
npm run dev
```

| 服务 | 地址 |
| --- | --- |
| Web 应用 | [http://localhost:5190](http://localhost:5190) |
| API 健康检查 | [http://localhost:3002/api/health](http://localhost:3002/api/health) |
| 示例项目列表 | [http://localhost:5190/projects/TJ/issues](http://localhost:5190/projects/TJ/issues) |

健康检查正常时返回：

```json
{ "ok": true, "db": "ok" }
```

开发环境中，Vite 将 `/api` 和 `/uploads` 转发到 `http://localhost:3002`。修改后端端口时，需要同步调整 [后端入口](server/src/index.ts) 和 [Vite 代理配置](web/vite.config.ts)。

日常启动只需 `npm run dev`。拉取包含新迁移的代码后运行 `npm run db:migrate`，无需重新 seed。

## 项目结构

```text
.
├── package.json                 # workspace 配置与统一命令
├── package-lock.json            # 依赖锁文件
├── .husky/                      # 提交前检查与提交信息检查
├── .vscode/                     # 编辑器设置与扩展推荐
├── docs/
│   └── commit-convention.md     # 提交信息规范
├── shared/
│   └── src/index.ts             # 共享类型、常量与 Zod schema
├── server/
│   ├── data/                    # 本地 SQLite 数据库
│   ├── drizzle/                 # 迁移 SQL、快照与 journal
│   ├── uploads/                 # 图片文件，首次上传时自动创建
│   ├── drizzle.config.ts
│   └── src/
│       ├── app.ts              # 路由装配、统一错误处理、AppType
│       ├── index.ts            # HTTP 服务入口
│       ├── db/                 # 表结构、数据库连接与种子数据
│       ├── routes/             # 项目、Issue、附件接口
│       └── lib/                # 编号解析与数据转换
└── web/
    └── src/
        ├── pages/              # 列表、详情和占位页面
        ├── components/         # 业务组件及 UI 基础组件
        ├── hooks/              # 请求、自动保存及图片粘贴
        ├── lib/                # API 客户端、缓存配置与工具
        ├── mocks/              # 当前项目的固定展示配置
        └── router.tsx          # 路由定义
```

### 数据如何流转

前端通过 `hc<AppType>` 调用 Hono 接口，接口的路径、参数和响应类型由后端路由推导。`shared` 提供前后端共用的 Zod schema 与业务类型；`server` 和 `shared` 直接导出 TypeScript 源码，不需要先单独打包。

标题和描述先更新本地草稿，再由自动保存 Hook 串行提交 PATCH。描述以 **Markdown 字符串**写入数据库；图片先上传取得 URL，再插入编辑器，最终随描述一起保存。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 按锁文件安装所有依赖 |
| `npm run dev` | 同时启动 Web 与 API |
| `npm run dev -w @raven/web` | 单独启动前端 |
| `npm run dev -w @raven/server` | 单独启动后端，监听源码变化 |
| `npm run typecheck` | 检查所有 workspace 的类型 |
| `npm run lint` | 运行当前已配置的前端 oxlint 检查 |
| `npm run fmt` | 使用 oxfmt 格式化代码 |
| `npm run fmt:check` | 只检查格式，不修改文件 |
| `npm run build` | 前端类型检查与构建，产物位于 `web/dist/` |
| `npm run preview -w @raven/web` | 本地预览前端构建产物，API 仍需运行 |
| `npm run db:generate` | 根据 schema 生成新的迁移文件 |
| `npm run db:migrate` | 将已有迁移应用到本地数据库 |
| `npm run db:studio` | 打开 Drizzle Studio 查看数据库 |
| `npm run db:seed` | **清空业务数据并重新写入示例数据** |

新增依赖时，在仓库根目录指定目标 workspace：

```bash
npm install <package-name> -w @raven/web
npm install <package-name> -w @raven/server
```

`npm run build` 不会生成后端部署包，也不等于完成整个应用的部署。完整的本地工程检查可依次执行：

```bash
npm run fmt:check
npm run lint
npm run typecheck
npm run build
```

## 数据库与图片存储

| 内容 | 位置或约定 |
| --- | --- |
| 数据库文件 | `server/data/raven.db` |
| 数据表定义 | `server/src/db/schema.ts` |
| 数据库迁移 | `server/drizzle/` |
| 上传图片 | `server/uploads/` |
| 图片地址 | `/uploads/<UUID 文件名>` |
| Issue 编号 | 项目 key + 项目内编号，例如 `TJ-36` |
| API 时间 | ISO 8601 字符串 |

修改表结构后，先执行 `db:generate`，检查 SQL，再执行 `db:migrate`。迁移 SQL、快照及 journal 应一起提交到 Git。

数据库文件和上传图片已被 `.gitignore` 排除。备份数据时需要同时保留数据库与上传目录。执行 seed 会连带删除旧 Issue 的附件记录，但不会删除磁盘上的图片文件。

上传接口每次接收一张 PNG、JPEG、GIF 或 WebP 图片：单文件最大 **5 MiB**，整个 multipart 请求最大 **6 MiB**。后端检查 MIME 与文件头，并使用生成的 UUID 文件名存储。当前尚未接入登录和访问控制，图片 URL 可直接访问。

## API 概览

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/health` | 检查服务与数据库连接 |
| GET | `/api/projects/:key/issues` | 获取项目 Issue 列表 |
| POST | `/api/projects/:key/issues` | 新建 Issue，事务内生成编号 |
| GET | `/api/issues/:identifier` | 获取 Issue 详情 |
| PATCH | `/api/issues/:identifier` | 更新标题、描述、状态、优先级或标签 |
| GET | `/api/labels` | 获取标签列表 |
| POST | `/api/issues/:identifier/attachments` | 上传图片，表单字段为 `file` |
| GET | `/uploads/:filename` | 读取已有附件图片 |

其中 `key` 例如 `TJ`，`identifier` 例如 `TJ-36`。接口错误统一使用 `{ "error": "错误说明" }`，同时返回相应 HTTP 状态码。

## 开发约定

### VS Code

用 VS Code 打开仓库根目录，按工作区推荐安装 **Oxc** 扩展（`oxc.oxc-vscode`）。项目已经配置保存时自动格式化，规则为无分号、单引号、行宽 100；Markdown 不参与自动格式化。

### Git 提交

项目使用 Husky 自动执行：

- **pre-commit**：lint-staged 格式化暂存代码，对前端 TS / TSX 执行 oxlint，并检查全部 workspace 的类型。
- **commit-msg**：commitlint 检查 Conventional Commits 格式。

提交信息示例：

```text
feat(web): 支持描述粘贴图片并自动保存
fix(server): 修复附件上传校验
docs: 完善项目介绍与启动说明
```

完整规则见 [提交信息规范](docs/commit-convention.md)。`style` 表示代码格式调整；界面样式的新增或修复应按实际改动使用 `feat` 或 `fix`。

## 常见问题

**数据库迁移提示无法打开 `data/raven.db`**

确认从仓库根目录运行命令，并保留 `server/data/` 目录。如果目录缺失，先创建它，再运行 `npm run db:migrate`。

**接口提示 `no such table`**

先执行 `npm run db:migrate`。生成迁移不会自动应用迁移，seed 也不能替代建表。

**首次打开示例项目提示不存在**

检查是否已初始化示例数据。只有在数据库为空或明确允许重置时，才运行 `npm run db:seed`。

**后端图片地址正常，前端无法显示图片**

检查 `/uploads` 代理是否指向后端 3002 端口，以及 Web 和 API 是否都在运行。

**安装新编辑器扩展后，Vite 仍提示找不到模块**

确认依赖安装到了 `@raven/web`，然后重启原来的前端开发进程，刷新依赖解析缓存。

## 后续计划

- 图片拖拽上传、上传占位与失败重试。
- 登录注册、工作区隔离、负责人选择与评论。
- 筛选、快捷键、命令面板与看板拖拽。
- WebSocket 实时同步。
- 性能优化、自动化测试与部署配置。


