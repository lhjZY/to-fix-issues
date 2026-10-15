// 提交信息规范：Conventional Commits，说明见 docs/commit-convention.md
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'perf', // 性能优化
        'refactor', // 重构：不改变外部行为
        'style', // 代码格式：空格、缩进、引号等，不改变逻辑
        'docs', // 文档
        'test', // 测试
        'build', // 构建系统、依赖
        'ci', // 持续集成配置
        'chore', // 其他杂项：工具配置等
        'revert', // 回滚
      ],
    ],
    'scope-enum': [2, 'always', ['web', 'server', 'shared', 'deps', 'config']],
    // 允许中文描述，不限制大小写
    'subject-case': [0],
  },
}
