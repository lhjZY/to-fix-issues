import { useState } from 'react'

type Tab = 'Overview' | 'Activity' | 'Issues'

type TabButtonProps = {
  label: string
  active: boolean
  onClick: () => void
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 ${
        active ? 'bg-surface text-fg' : 'text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

type PageHeaderProps = {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Issues')
  return (
    <header className="border-b border-line">
      <div className="flex h-12 items-center px-6 font-medium">{title}</div>
      <div className="flex gap-1 px-5 pb-3">
        <TabButton
          label="Overview"
          active={activeTab === 'Overview'}
          onClick={() => setActiveTab('Overview')}
        />
        <TabButton
          label="Activity"
          active={activeTab === 'Activity'}
          onClick={() => setActiveTab('Activity')}
        />
        <TabButton
          label="Issues"
          active={activeTab === 'Issues'}
          onClick={() => setActiveTab('Issues')}
        />
      </div>
    </header>
  )
}
