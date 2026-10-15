import { AppLayout } from './components/AppLayout'
import { PageHeader } from './components/PageHeader'
import { IssueList } from './components/IssueList'
import { mockIssues } from './mocks/issues'

function App() {
  return (
    <AppLayout>
      <PageHeader title="TJ-翻译器" />
      <IssueList issues={mockIssues} />
    </AppLayout>
  )
}

export default App
