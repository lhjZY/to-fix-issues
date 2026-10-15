import { useEffect, useState } from 'react'

type ApiStatus = 'checking' | 'online' | 'offline'

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
  }, [])
  return (
    <main>
      <h1>Raven</h1>
      <p>API: {apiStatus}</p>
    </main>
  )
}

export default App
