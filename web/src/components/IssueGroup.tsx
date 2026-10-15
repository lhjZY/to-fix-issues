import { useState } from 'react'
import { STATUS_LABEL, type Issue, type IssueStatus } from '@raven/shared'
import { Plus, ChevronDown } from 'lucide-react'
import { IssueRow } from './IssueRow.tsx'
import { StatusIcon } from './StatusIcon.tsx'
import { CreateIssueDialog } from './CreateIssueDialog.tsx'
type IssueGroupProps = {
  status: IssueStatus
  issues: Issue[]
}

export function IssueGroup({ status, issues }: IssueGroupProps) {
  // 每个group记住自己的折叠状态
  const [collapsed, setCollapsed] = useState(false)
  return (
    <section>
      <div className="mx-2 flex h-9 items-center gap-2 rounded-md bg-surface pr-2">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-expanded={!collapsed}
          className="flex h-full flex-1 items-center gap-2 pl-2"
        >
          <ChevronDown
            className={`size-3.5 text-fg-subtle transition-transform ${collapsed ? '-rotate-90' : ''}`}
          />
          <StatusIcon status={status} />
          <span className="font-medium">{STATUS_LABEL[status]}</span>
          <span className="text-fg-subtle">{issues.length}</span>
        </button>

        {/* 点击 + 打开新建弹窗，状态默认为当前分组的状态 */}
        <CreateIssueDialog
          status={status}
          trigger={
            <button
              type="button"
              aria-label="New issue"
              className="rounded p-1 text-fg-muted hover:bg-canvas hover:text-fg"
            >
              <Plus className="size-4" />
            </button>
          }
        />
      </div>

      {!collapsed && issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
    </section>
  )
}
