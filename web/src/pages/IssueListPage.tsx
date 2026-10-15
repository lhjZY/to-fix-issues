import { useParams } from 'react-router'
import { IssueList } from '../components/IssueList.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { mockProject } from '../mocks/projects.ts'
import { NotFoundPage } from './NotFoundPage.tsx'
import { useIssues } from '../hooks/useIssues.ts'
export function IssueListPage() {
  // 读取 URL 中的 :projectKey，例如 /projects/TJ/issues 中的 'TJ'
  const { projectKey = '' } = useParams()
  // Hook 必须写在所有 return 之前
  const { data: issues, isError } = useIssues(projectKey)

  if (isError) {
    return <NotFoundPage />
  }
  if (!issues) {
    return null
  }
  return (
    <>
      <PageHeader title={mockProject.name} />
      <IssueList issues={issues} />
    </>
  )
}
