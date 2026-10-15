import { useEffect, useState } from 'react'
import { APP_NAME } from '@raven/shared'
type ApiStatus = 'checking' | 'online' | 'offline'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
  }, [])
  return (
    <main className="p-6">
      <h1 className="text-lg font-semibold">{APP_NAME}</h1>
      <p className="mt-2 text-fg-muted">API: {apiStatus}</p>
      <div className="mt-6 w-64 rounded-md border border-line bg-surface p-4">
        <p className="text-accent">主题颜色示例</p>
        <p className="mt-1 text-fg-subtle">surface 背景 + line 边框</p>
      </div>
    </main>
  )
}

export default App
