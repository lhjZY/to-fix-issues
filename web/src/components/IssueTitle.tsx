import { UpdateIssueInputSchema } from '@raven/shared'
import { useCallback, useEffect, useState } from 'react'
import type { useUpdateIssue } from '../hooks/useUpdateIssue.ts'
import { Button } from './ui/button.tsx'
import { Input } from './ui/input.tsx'

type IssueTitleProps = {
  title: string
  updateIssue: ReturnType<typeof useUpdateIssue>
}

export function IssueTitle({ title, updateIssue }: IssueTitleProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const [failedDraft, setFailedDraft] = useState<string | null>(null)
  const { mutate, isPending, reset } = updateIssue

  const result = draft === null ? null : UpdateIssueInputSchema.safeParse({ title: draft })
  const nextTitle = result?.success ? result.data.title : undefined
  const error = result && !result.success ? result.error.issues[0].message : ''
  const canSave =
    draft !== null && nextTitle !== undefined && nextTitle !== title && !isPending && !isComposing

  // 定时保存和手动保存共用同一段逻辑。
  const saveTitle = useCallback(() => {
    if (
      draft === null ||
      nextTitle === undefined ||
      nextTitle === title ||
      isPending ||
      isComposing
    )
      return
    mutate(
      { title: nextTitle },
      {
        onSuccess: () => {
          setDraft(nextTitle)
          setFailedDraft(null)
        },
        onError: () => setFailedDraft(draft),
      },
    )
  }, [draft, nextTitle, title, isPending, isComposing, mutate])

  // 防抖effect
  useEffect(() => {
    // 失败的同一份草稿不自动重试，避免服务器故障时不停发请求。
    if (!canSave || draft === failedDraft) return
    const timer = setTimeout(saveTitle, 800)
    return () => clearTimeout(timer)
  }, [canSave, draft, failedDraft, saveTitle])

  if (draft === null) {
    return (
      <h1 className="text-2xl font-semibold">
        <button
          type="button"
          className="w-full rounded text-left break-words outline-none hover:bg-elevated focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
          aria-label={`编辑标题：${title}`}
          disabled={isPending}
          onClick={() => {
            setDraft(title)
            setFailedDraft(null)
            setIsComposing(false)
            reset()
          }}
        >
          {title}
        </button>
      </h1>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        saveTitle()
      }}
      className="flex flex-col gap-2"
    >
      <Input
        autoFocus
        aria-label="Issue 标题"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'issue-title-error' : 'issue-title-help'}
        value={draft}
        readOnly={isPending}
        aria-busy={isPending}
        onChange={(event) => setDraft(event.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={(event) => {
          // 确认输入法候选词时，不提交表单或结束编辑。
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
            if (event.key === 'Enter') event.preventDefault()
            return
          }
          if (event.key === 'Escape' && !isPending) {
            event.preventDefault()
            setDraft(null)
            setIsComposing(false)
            reset()
          }
        }}
      />
      {error && (
        <p id="issue-title-error" role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <p id="issue-title-help" className="text-xs text-fg-muted">
        停止输入后自动保存。结束编辑只放弃尚未保存的修改。
      </p>
      {draft === failedDraft && (
        <p role="alert" className="text-xs text-destructive">
          自动保存已暂停，请重试或修改标题。
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!canSave}>
          {draft === failedDraft ? '重试保存' : '立即保存'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setDraft(null)
            setIsComposing(false)
            reset()
          }}
        >
          结束编辑
        </Button>
      </div>
    </form>
  )
}
