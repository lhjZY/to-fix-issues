import { useParams } from 'react-router'
import { IssueList } from '../components/IssueList.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { mockIssues } from '../mocks/issues.ts'
import { mockProject } from '../mocks/projects.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

export function IssueListPage() {
  // 读取 URL 中的 :projectKey，例如 /projects/TJ/issues 中的 'TJ'
  const { projectKey } = useParams()

  if (projectKey !== mockProject.key) {
    return <NotFoundPage />
  }

  return (
    <>
      <PageHeader title={mockProject.name} />
      <IssueList issues={mockIssues} />
    </>
  )
}
