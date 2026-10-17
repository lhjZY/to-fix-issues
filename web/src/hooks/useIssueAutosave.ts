import { UpdateIssueInputSchema, type Issue, type UpdateIssueInput } from '@raven/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import type { useUpdateIssue } from './useUpdateIssue.ts'

type Draft = Pick<Issue, 'title' | 'description'>

export function useIssueAutosave(
  issue: Issue,
  updateIssue: ReturnType<typeof useUpdateIssue>,
  uploadUnfinished: boolean,
) {
  const [draft, setDraft] = useState<Draft>(() => ({
    title: issue.title,
    description: issue.description,
  }))
  const [saved, setSaved] = useState(draft)
  const [failed, setFailed] = useState(false)
  const [composing, setComposing] = useState(false)
  const [choosingCommand, setChoosingCommand] = useState(false)
  const [flushRequested, setFlushRequested] = useState(false)
  const inFlight = useRef(false)
  const { mutate, isPending } = updateIssue
  const titleResult = UpdateIssueInputSchema.safeParse({ title: draft.title })
  const title = titleResult.success ? titleResult.data.title : undefined
  const titleError = titleResult.success ? '' : titleResult.error.issues[0].message
  const dirty = draft.title.trim() !== saved.title || draft.description !== saved.description
  const blocked = composing || choosingCommand
  const blocker = useBlocker(dirty || isPending || uploadUnfinished)
  const leaving = blocker.state === 'blocked'

  const save = useCallback(() => {
    if (isPending || inFlight.current || blocked) return
    const input: UpdateIssueInput = {}
    if (title !== undefined && title !== saved.title) input.title = title
    if (draft.description !== saved.description) input.description = draft.description
    if (Object.keys(input).length === 0) return

    // React 更新 pending 前也要防住 blur 与定时器同一时刻触发。
    inFlight.current = true
    mutate(input, {
      onSuccess: () => {
        // 只确认本次发送的快照，不把旧请求结果写回用户正在输入的 draft。
        setSaved((previous) => ({ ...previous, ...input }))
        setFailed(false)
      },
      onError: () => setFailed(true),
      onSettled: () => {
        inFlight.current = false
        setFlushRequested(false)
      },
    })
  }, [isPending, blocked, title, saved.title, saved.description, draft.description, mutate])

  useEffect(() => {
    if (!dirty || failed || blocked || isPending) return
    const timer = setTimeout(save, flushRequested || leaving ? 0 : 800)
    return () => clearTimeout(timer)
  }, [dirty, failed, blocked, isPending, flushRequested, leaving, save])

  useEffect(() => {
    if (blocker.state === 'blocked' && !dirty && !isPending && !uploadUnfinished) blocker.proceed()
  }, [blocker, dirty, isPending, uploadUnfinished])

  useEffect(() => {
    if (!dirty && !isPending && !uploadUnfinished) return
    const warnBeforeClose = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warnBeforeClose)
    return () => window.removeEventListener('beforeunload', warnBeforeClose)
  }, [dirty, isPending, uploadUnfinished])

  return {
    draft,
    titleError,
    dirty,
    failed,
    leaving,
    blocker,
    setComposing,
    setChoosingCommand,
    change: (field: keyof Draft, value: string) => {
      setDraft((previous) => ({ ...previous, [field]: value }))
      setFailed(false)
      setFlushRequested(false)
    },
    flush: () => {
      if (dirty) setFlushRequested(true)
    },
    retry: () => {
      setFailed(false)
      setFlushRequested(true)
    },
  }
}
