import type { IssuePriority } from '@raven/shared'

type PriorityIconProps = {
  priority: IssuePriority
}

export function PriorityIcon({ priority }: PriorityIconProps) {
  // 无优先级：三条短横线
  if (priority === 0) {
    return (
      <svg viewBox="0 0 14 14" className="size-3.5 text-fg-subtle">
        <path
          d="M2 7h2M6 7h2M10 7h2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Urgent：橙色方块 + 感叹号
  if (priority === 1) {
    return (
      <svg viewBox="0 0 14 14" className="size-3.5 text-priority-urgent">
        <rect x="1" y="1" width="12" height="12" rx="3" fill="currentColor" />
        <path d="M7 4v3.5" strokeWidth="1.5" strokeLinecap="round" className="stroke-canvas" />
        <circle cx="7" cy="10" r="0.9" className="fill-canvas" />
      </svg>
    )
  }

  // 走到这里时 priority 只可能是 2、3、4
  // High(2) 亮 3 格，Medium(3) 亮 2 格，Low(4) 亮 1 格
  const litBars = 5 - priority

  return (
    <svg viewBox="0 0 14 14" className="size-3.5">
      <rect
        x="1.5"
        y="8"
        width="3"
        height="5"
        rx="1"
        className={litBars >= 1 ? 'fill-fg-muted' : 'fill-priority-bar-off'}
      />
      <rect
        x="5.5"
        y="5"
        width="3"
        height="8"
        rx="1"
        className={litBars >= 2 ? 'fill-fg-muted' : 'fill-priority-bar-off'}
      />
      <rect
        x="9.5"
        y="2"
        width="3"
        height="11"
        rx="1"
        className={litBars >= 3 ? 'fill-fg-muted' : 'fill-priority-bar-off'}
      />
    </svg>
  )
}
