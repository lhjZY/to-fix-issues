import { APP_NAME } from '@raven/shared'
import { NavLink } from 'react-router'
import { mockProject } from '../mocks/projects.ts'

type SidebarItemProps = {
  label: string
  to: string
}

function SidebarItem({ label, to }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      // NavLink 会告诉我们它是否匹配当前 URL，据此决定高亮样式
      className={({ isActive }) =>
        `rounded-md px-2 py-1.5 ${
          isActive ? 'bg-surface text-fg' : 'text-fg-muted hover:bg-surface hover:text-fg'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line px-3 py-4">
      <div className="px-2 font-semibold">{APP_NAME}</div>

      <nav className="mt-4 flex flex-col gap-0.5">
        <SidebarItem label="Inbox" to="/inbox" />
        <SidebarItem label="My issues" to="/my-issues" />
      </nav>

      <div className="mt-6 px-2 text-xs text-fg-subtle">Projects</div>
      <nav className="mt-1 flex flex-col gap-0.5">
        <SidebarItem label={mockProject.name} to={`/projects/${mockProject.key}/issues`} />
      </nav>
    </aside>
  )
}
