import { APP_NAME } from '@raven/shared'

type SidebarItemProps = {
  label: string
  active?: boolean
}

function SidebarItem({ label, active = false }: SidebarItemProps) {
  return (
    <div
      className={`cursor-pointer rounded-md px-2 py-1.5 ${
        active ? 'bg-surface text-fg' : 'text-fg-muted hover:bg-surface hover:text-fg'
      }`}
    >
      {label}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line px-3 py-4">
      <div className="px-2 font-semibold">{APP_NAME}</div>

      <nav className="mt-4 flex flex-col gap-0.5">
        <SidebarItem label="Inbox" />
        <SidebarItem label="My issues" />
      </nav>

      <div className="mt-6 px-2 text-xs text-fg-subtle">Projects</div>
      <nav className="mt-1 flex flex-col gap-0.5">
        <SidebarItem label="TJ-翻译器" active />
      </nav>
    </aside>
  )
}
