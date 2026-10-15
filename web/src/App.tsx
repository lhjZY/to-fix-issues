import { AppLayout } from './components/AppLayout'
import { PageHeader } from './components/PageHeader'
import { IssueRow } from './components/IssueRow.tsx'
import { mockIssues } from './mocks/issues'

function App() {
  return (
    <AppLayout>
      <PageHeader title="TJ-翻译器" />
      <div className="py-2">
        {mockIssues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </div>
    </AppLayout>
  )
}

export default App
