# 提交信息规范

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范。提交时 husky 会调用 commitlint 自动校验，不符合规范的提交会被拒绝。

## 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **第一行必填**，总长度不超过 100 个字符。`(<scope>)` 可以省略。
- `<body>` 和 `<footer>` 可选，和第一行之间各空一行。

示例：

```
feat(web): 新增 IssueRow 组件
```

```
fix(server): 修复 issue 编号并发时重复的问题

新建 issue 时先读后写 issue_counter，并发请求会拿到同一个编号。
改为在事务中执行自增。
```

## type：这次提交属于哪一类

| type | 含义 | 什么时候用 |
|---|---|---|
| `feat` | 新功能 | 用户能感知到的新能力：新页面、新组件、新接口 |
| `fix` | 修复 | 修复 bug：行为不符合预期 |
| `perf` | 性能优化 | 让它更快、更省资源，功能不变 |
| `refactor` | 重构 | 调整代码结构，**外部行为完全不变**：拆分组件、重命名、抽出函数 |
| `style` | 代码格式 | 只改空格、缩进、引号、分号等，**不改逻辑，也不改界面** |
| `docs` | 文档 | README、注释、文档文件 |
| `test` | 测试 | 新增或修改测试 |
| `build` | 构建 / 依赖 | 增删、升级依赖，改动 Vite、tsconfig 等构建配置 |
| `ci` | 持续集成 | GitHub Actions 等 CI 配置 |
| `chore` | 杂项 | 不属于以上类别的工具配置，比如 husky、commitlint、oxfmt |
| `revert` | 回滚 | 撤销之前的某次提交 |

### 容易混淆的几组

**`style` 不是"界面样式"**

在这个规范里，`style` 指的是**代码风格**，比如缩进、空格这类格式调整。修改**界面样式**（颜色、间距、布局）会影响用户看到的效果，应该归为：

- 新增的视觉效果，比如加了悬停高亮：`feat(web): 列表行增加悬停高亮`
- 修正错误的显示，比如对不齐、颜色不对：`fix(web): 修复编号列宽度不一致导致的错位`

**`refactor` 和 `perf` 的区别**

两者都不改变功能。目的是"让代码更好读、更好改"的，用 `refactor`；目的是"让它更快"的，用 `perf`。

**一次提交只做一件事**

如果一次改动里既修了 bug 又重构了代码，最好拆成两次提交。这样 Review 和回滚都更容易。

## scope：改动了哪个子包

| scope | 范围 |
|---|---|
| `web` | 前端 `web/` |
| `server` | 后端 `server/` |
| `shared` | 共享包 `shared/` |
| `deps` | 依赖升级 |
| `config` | 根目录的工程配置 |

scope 可以省略。同一次提交涉及多个子包时，可以省略 scope，也可以选主要的那个。

## subject：一句话说明做了什么

- 用中文或英文都可以，描述**做了什么**，而不是**怎么做的**。
- 动词开头：新增、修复、调整、拆分、删除……
- 结尾不加句号。

| ❌ 不好 | ✅ 好 |
|---|---|
| `fix: bug` | `fix(web): 修复点击标签页时高亮不切换` |
| `feat: 改了一些东西` | `feat(web): 新增优先级图标组件` |
| `update` | `refactor(web): 将 TabButton 改为数组渲染` |

## 本项目常见示例

```
feat(web): 新增 StatusIcon 组件
feat(server): 新增 GET /api/health 接口
fix(web): 修复侧边栏悬停样式类名错误
refactor(web): 抽出 AppLayout 组件
style: 统一使用单引号
build(deps): 升级 vite 到 8.4
chore(config): 配置 husky 与 commitlint
docs: 补充启动说明
```

## 提交前会自动执行的检查

| 阶段 | 检查内容 | 不通过时 |
|---|---|---|
| `pre-commit` | 暂存文件用 oxfmt 格式化；web 代码用 oxlint 检查；全部子包做 typecheck | 提交被拒绝 |
| `commit-msg` | 用 commitlint 校验提交信息的格式 | 提交被拒绝，终端会提示具体原因 |

确实需要跳过检查时（不推荐）：`git commit --no-verify`。
