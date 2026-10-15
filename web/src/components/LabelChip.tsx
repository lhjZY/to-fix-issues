import type { Label } from '@raven/shared'

type LabelChipProps = {
  label: Label
}

export function LabelChip({ label }: LabelChipProps) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-xs text-fg-muted">
      {/* 颜色来自数据，无法预先写成 Tailwind 类名，所以用 style */}
      <span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />
      {label.name}
    </span>
  )
}
