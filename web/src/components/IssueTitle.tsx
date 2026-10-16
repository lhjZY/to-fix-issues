import { UpdateIssueInputSchema } from '@raven/shared'
import { useState } from 'react'
import type { useUpdateIssue } from '../hooks/useUpdateIssue.ts'
import { Button } from './ui/button.tsx'
import { Input } from './ui/input.tsx'

type IssueTitleProps = {
  title: string
  updateIssue: ReturnType<typeof useUpdateIssue>
}

export function IssueTitle({ title, updateIssue }: IssueTitleProps) {
  // null 表示浏览状态，字符串表示正在编辑的草稿（包括空字符串）。
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (draft === null) {
    return (
      <h1 className="text-2xl font-semibold">
        <button
          type="button"
          className="w-full rounded text-left break-words outline-none hover:bg-elevated focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
          aria-label={`编辑标题：${title}`}
          disabled={updateIssue.isPending}
          onClick={() => {
            setDraft(title)
            setError('')
            updateIssue.reset()
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
        if (updateIssue.isPending) return
        const result = UpdateIssueInputSchema.safeParse({ title: draft })
        if (!result.success) {
          setError(result.error.issues[0].message)
          return
        }
        const nextTitle = result.data.title
        if (nextTitle === undefined) return
        if (nextTitle === title) {
          setDraft(null)
          updateIssue.reset()
          return
        }
        setError('')
        updateIssue.mutate({ title: nextTitle }, { onSuccess: () => setDraft(null) })
      }}
      className="flex flex-col gap-2"
    >
      <Input
        autoFocus
        aria-label="Issue 标题"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'issue-title-error' : undefined}
        value={draft}
        disabled={updateIssue.isPending}
        onChange={(event) => {
          setDraft(event.target.value)
          setError('')
        }}
        onKeyDown={(event) => {
          // 中文输入法确认候选词时，Enter 不应提交，Esc 也不应取消编辑。
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
            if (event.key === 'Enter') event.preventDefault()
            return
          }
          if (event.key === 'Escape' && !updateIssue.isPending) {
            event.preventDefault()
            setDraft(null)
            setError('')
            updateIssue.reset()
          }
        }}
      />
      {error && (
        <p id="issue-title-error" role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={updateIssue.isPending}>
          保存
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updateIssue.isPending}
          onClick={() => {
            setDraft(null)
            setError('')
            updateIssue.reset()
          }}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
