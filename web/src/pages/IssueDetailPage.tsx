import type { Issue } from '@raven/shared'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ErrorState } from '../components/ErrorState.tsx'
import { IssueTitle } from '../components/IssueTitle.tsx'
import { IssueDescription } from '../components/IssueDescription.tsx'
import { useUpdateIssue } from '../hooks/useUpdateIssue.ts'
import type { ImageUploadState } from '../hooks/useImagePaste.ts'
import { useIssueAutosave } from '../hooks/useIssueAutosave.ts'
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
  if (isError && !issue) {
    // 404 说明 issue 不存在；其他错误给出重试按钮
    return isNotFound(error) ? <NotFoundPage /> : <ErrorState onRetry={() => refetch()} />
  }

  return <IssueDetail key={issue.identifier} issue={issue} />
}

// 等查询成功再挂载编辑区域，切换 issue 时清掉旧草稿和请求状态。
function IssueDetail({ issue }: { issue: Issue }) {
  const [uploadState, setUploadState] = useState<ImageUploadState>('idle')
  const uploading = uploadState === 'uploading'
  const updateIssue = useUpdateIssue(issue.identifier, mockProject.key)
  const autosave = useIssueAutosave(issue, updateIssue, uploadState !== 'idle')

  return (
    <div className="flex h-full flex-col">
      {/* 顶部栏：面包屑 */}
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-line px-6 text-fg-muted">
        <Link to={`/projects/${mockProject.key}/issues`} className="hover:text-fg">
          {mockProject.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg">{issue.identifier}</span>
        <span className="truncate text-fg">{autosave.draft.title}</span>
        <span role="status" className="ml-auto shrink-0 text-xs text-fg-subtle">
          {autosave.failed || uploadState === 'error'
            ? '保存失败'
            : uploading
              ? '图片上传中…'
              : updateIssue.isPending
                ? '保存中…'
                : autosave.dirty
                  ? '未保存'
                  : '已保存'}
        </span>
      </header>

      {/* 左右两栏，各自独立滚动 */}
      <div className="flex min-h-0 flex-1">
        <div data-editor-scroll className="min-w-0 flex-1 overflow-auto px-12 py-10">
          <IssueTitle
            value={autosave.draft.title}
            error={autosave.titleError}
            onChange={(value) => autosave.change('title', value)}
            onBlur={autosave.flush}
            onComposingChange={autosave.setComposing}
          />
          {(autosave.failed || updateIssue.isError) && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              保存失败，输入内容已保留。
              {autosave.failed && (
                <button type="button" className="ml-2 underline" onClick={autosave.retry}>
                  重试保存
                </button>
              )}
            </p>
          )}
          <IssueDescription
            identifier={issue.identifier}
            value={autosave.draft.description}
            onChange={(value) => autosave.change('description', value)}
            onBlur={autosave.flush}
            onComposingChange={autosave.setComposing}
            onMenuChange={autosave.setChoosingCommand}
            onUploadStateChange={setUploadState}
          />
          {autosave.leaving && uploading && (
            <p role="status" className="mt-4 text-xs text-fg-muted">
              正在上传图片，完成并保存后自动离开。
              <button
                type="button"
                className="ml-2 underline"
                onClick={() => autosave.blocker.reset?.()}
              >
                继续编辑
              </button>
            </p>
          )}
          {autosave.leaving &&
            (autosave.failed || autosave.titleError || uploadState === 'error') && (
              <div role="alert" className="mt-4 flex items-center gap-3 text-xs text-fg-muted">
                {uploadState === 'error'
                  ? '图片上传失败，请重新粘贴，或放弃本次上传后离开。'
                  : '修改尚未保存，请修正标题或重试。'}
                <button
                  type="button"
                  className="underline"
                  onClick={() => autosave.blocker.reset?.()}
                >
                  继续编辑
                </button>
                <button
                  type="button"
                  className="underline"
                  onClick={() => autosave.blocker.proceed?.()}
                >
                  放弃未完成内容并离开
                </button>
              </div>
            )}
        </div>

        <aside className="w-72 shrink-0 overflow-auto border-l border-line px-4 py-8">
          <IssueProperties issue={issue} project={mockProject} updateIssue={updateIssue} />
        </aside>
      </div>
    </div>
  )
}
