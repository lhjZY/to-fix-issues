import { useEffect, useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { StatusIcon } from './components/StatusIcon'
import { PriorityIcon } from './components/PriorityIcon'
import { PageHeader } from './components/PageHeader'
import { mockIssues } from './mocks/issues'
type ApiStatus = 'checking' | 'online' | 'offline'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
  }, [])
  return (
    <AppLayout>
      <PageHeader title="TJ-翻译器" />
      <div className="p-6">
        <p className="text-fg-muted">API: {apiStatus}</p>
        <p className="mt-2 text-fg-muted">Issues: {mockIssues.length}</p>

        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon status="backlog" /> Backlog
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="todo" /> Todo
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="in_progress" /> In Progress
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="done" /> Done
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status="canceled" /> Canceled
          </div>
        </div>

        {/* 临时演示，第 12 步用到 IssueRow 后删除 */}
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <PriorityIcon priority={0} /> No priority
          </div>
          <div className="flex items-center gap-2">
            <PriorityIcon priority={1} /> Urgent
          </div>
          <div className="flex items-center gap-2">
            <PriorityIcon priority={2} /> High
          </div>
          <div className="flex items-center gap-2">
            <PriorityIcon priority={3} /> Medium
          </div>
          <div className="flex items-center gap-2">
            <PriorityIcon priority={4} /> Low
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default App
