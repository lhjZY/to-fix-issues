import type { Issue } from '@raven/shared'
import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ErrorState } from '../components/ErrorState.tsx'
import { IssueProperties } from '../components/IssueProperties.tsx'
import { LoadingState } from '../components/LoadingState.tsx'
import { useIssue } from '../hooks/useIssue.ts'
import { isNotFound } from '../lib/http-error.ts'
import { mockProject } from '../mocks/projects.ts'
import { NotFoundPage } from './NotFoundPage.tsx'
import { useUpdateIssue } from '../hooks/useUpdateIssue.ts'
import { IssueTitle } from '../components/IssueTitle.tsx'
import { MarkdownContent } from '../components/MarkdownContent.tsx'
export function IssueDetailPage() {
  const { identifier = '' } = useParams()
  const { data: issue, isPending, isError, error, refetch } = useIssue(identifier)

  if (isPending) {
    return <LoadingState />
  }

  if (isError) {
    // 404 说明 issue 不存在；其他错误给出重试按钮
    return isNotFound(error) ? <NotFoundPage /> : <ErrorState onRetry={() => refetch()} />
  }

  return <IssueDetail key={issue.identifier} issue={issue} />
}

// 等查询成功再挂载编辑区域，切换 issue 时清掉旧草稿和请求状态。
function IssueDetail({ issue }: { issue: Issue }) {
  const updateIssue = useUpdateIssue(issue.identifier, mockProject.key)

  return (
    <div className="flex h-full flex-col">
      {/* 顶部栏：面包屑 */}
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-line px-6 text-fg-muted">
        <Link to={`/projects/${mockProject.key}/issues`} className="hover:text-fg">
          {mockProject.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg">{issue.identifier}</span>
        <span className="truncate text-fg">{issue.title}</span>
      </header>

      {/* 左右两栏，各自独立滚动 */}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto px-12 py-10">
          <IssueTitle title={issue.title} updateIssue={updateIssue} />
          {updateIssue.isPending && (
            <p role="status" className="mt-2 text-xs text-fg-muted">
              保存中…
            </p>
          )}
          {updateIssue.isError && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              保存失败，请重试。
            </p>
          )}
          {issue.description.trim() ? (
            <div className="mt-6">
              <MarkdownContent content={issue.description} />
            </div>
          ) : (
            <p className="mt-6 text-fg-subtle">Add description…</p>
          )}
        </div>

        <aside className="w-72 shrink-0 overflow-auto border-l border-line px-4 py-8">
          <IssueProperties issue={issue} project={mockProject} updateIssue={updateIssue} />
        </aside>
      </div>
    </div>
  )
}
