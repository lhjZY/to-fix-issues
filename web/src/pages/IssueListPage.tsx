import { useParams } from 'react-router'
import { ErrorState } from '../components/ErrorState.tsx'
import { IssueList } from '../components/IssueList.tsx'
import { LoadingState } from '../components/LoadingState.tsx'
import { PageHeader } from '../components/PageHeader.tsx'
import { useIssues } from '../hooks/useIssues.ts'
import { isNotFound } from '../lib/http-error.ts'
import { mockProject } from '../mocks/projects.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

export function IssueListPage() {
  // 读取 URL 中的 :projectKey，例如 /projects/TJ/issues 中的 'TJ'
  const { projectKey = '' } = useParams()

  // Hook 必须写在所有 return 之前
  const { data: issues, isPending, isError, error, refetch } = useIssues(projectKey)

  if (isPending) {
    return <LoadingState />
  }
  if (isError) {
    // 404 说明项目不存在；其他错误给出重试按钮
    return isNotFound(error) ? <NotFoundPage /> : <ErrorState onRetry={() => refetch()} />
  }

  return (
    <>
      {/* 项目名暂时仍来自 mock，之后接入项目接口后替换 */}
      <PageHeader title={mockProject.name} />
      {issues.length === 0 ? (
        <p className="p-6 text-fg-subtle">这个项目还没有 issue。</p>
      ) : (
        <IssueList issues={issues} />
      )}
    </>
  )
}
