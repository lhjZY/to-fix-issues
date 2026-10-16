import { ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ErrorState } from '../components/ErrorState.tsx'
import { IssueProperties } from '../components/IssueProperties.tsx'
import { LoadingState } from '../components/LoadingState.tsx'
import { useIssue } from '../hooks/useIssue.ts'
import { isNotFound } from '../lib/http-error.ts'
import { mockProject } from '../mocks/projects.ts'
import { NotFoundPage } from './NotFoundPage.tsx'

export function IssueDetailPage() {
  // /issue/TJ-36 → identifier 为 'TJ-36'
  const { identifier = '' } = useParams()
  const { data: issue, isPending, isError, error, refetch } = useIssue(identifier)

  if (isPending) {
    return <LoadingState />
  }
  if (isError) {
    // 404 说明 issue 不存在；其他错误给出重试按钮
    return isNotFound(error) ? <NotFoundPage /> : <ErrorState onRetry={() => refetch()} />
  }

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
          <h1 className="text-2xl font-semibold">{issue.title}</h1>
          {issue.description ? (
            // 暂时按纯文本显示，第 37 步改为渲染 Markdown
            <p className="mt-6 leading-7 whitespace-pre-wrap">{issue.description}</p>
          ) : (
            <p className="mt-6 text-fg-subtle">Add description…</p>
          )}
        </div>

        <aside className="w-72 shrink-0 overflow-auto border-l border-line px-4 py-8">
          <IssueProperties key={issue.identifier} issue={issue} project={mockProject} />
        </aside>
      </div>
    </div>
  )
}
