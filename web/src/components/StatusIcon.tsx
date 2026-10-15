import type { IssueStatus } from '@raven/shared'

type StatusIconProps = {
  status: IssueStatus
}

export function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'backlog':
      // 虚线圆圈
      return (
        <svg viewBox="0 0 14 14" className="size-3.5 text-status-backlog">
          <circle
            cx="7"
            cy="7"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        </svg>
      )
    case 'todo':
      // 空心圆圈
      return (
        <svg viewBox="0 0 14 14" className="size-3.5 text-status-todo">
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )
    case 'in_progress':
      // 圆圈 + 右半边实心
      return (
        <svg viewBox="0 0 14 14" className="size-3.5 text-status-in-progress">
          <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3.5 A3.5 3.5 0 0 1 7 10.5 Z" fill="currentColor" />
        </svg>
      )
    case 'done':
      // 实心圆 + 对勾
      return (
        <svg viewBox="0 0 14 14" className="size-3.5 text-status-done">
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path
            d="M4.5 7.2 6.3 9l3.2-3.6"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-canvas"
          />
        </svg>
      )
    case 'canceled':
      // 实心圆 + 叉
      return (
        <svg viewBox="0 0 14 14" className="size-3.5 text-status-canceled">
          <circle cx="7" cy="7" r="7" fill="currentColor" />
          <path
            d="M5 5l4 4M9 5l-4 4"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="stroke-canvas"
          />
        </svg>
      )
    default: {
      // 穷尽检查：给 IssueStatus 新增状态却忘了在上面处理时，这里会报类型错误
      const unhandled: never = status
      throw new Error(`Unknown status: ${unhandled}`)
    }
  }
}
