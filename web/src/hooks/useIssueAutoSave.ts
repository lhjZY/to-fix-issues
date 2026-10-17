import { UpdateIssueInputSchema, type Issue, type UpdateIssueInput } from '@raven/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import type { useUpdateIssue } from './useUpdateIssue.ts'
type Draft = Pick<Issue, 'title' | 'description'>

export function useIssueAutoSave(issue: Issue, updateIssue: ReturnType<typeof useUpdateIssue>) {
  // 用户现在看到的内容，每次输入更新它
  const [draft, setDraft] = useState<Draft>(() => ({
    title: issue.title,
    description: issue.description,
  }))

  // saved After opening the details this time, the content that has already been confirmed by the server
  const [saved, setSaved] = useState(draft)

  // failed 用于暂停自动重试, 避免断网时不停请求.
  const [failed, setFailed] = useState(false)
  // 用户处于切换输入法,或者输入法正在候选单词还没确定时的状态
  const [composing, setComposing] = useState(false)
  // 是否正在选择编辑器命令
  const [choosingCommand, setChoosingCommand] = useState(false)
  //是否要求尽快保存，跳过 800ms 等待
  const [flushRequested, setFlushRequested] = useState(false)
  // ref 防住 blur 与计时器在 React 更新 pending 之前同时触发。
  const inFlight = useRef(false)
  // 防止上一份请求还没结束就提交下一份。
  const { mutate, isPending } = updateIssue
  const titleResult = UpdateIssueInputSchema.safeParse({ title: draft.title })
  const title = titleResult.success ? titleResult.data.title : undefined
  const titleError = titleResult.success ? '' : titleResult.error.issues[0].message
  const dirty = draft.title.trim() !== saved.title || draft.description !== saved.description
  // 根据 输入法与命令输入来判断是否要暂停保存
  const blocked = composing || choosingCommand
  const blocker = useBlocker(dirty || isPending)
  const leaving = blocker.state === 'blocked'

  const save = useCallback(() => {
    if (isPending || inFlight.current || blocked) return
    const input: UpdateIssueInput = {}
    if (title !== undefined && title !== saved.title) input.title = title
    if (draft.description !== saved.description) input.description = draft.description
    if (Object.keys(input).length === 0) return

    // react 更新pending前,防止blur与定时器同一时刻触发
    inFlight.current = true
    mutate(input, {
      onSuccess: () => {
        // 只确认本次发送的快照, 不把旧请求结果写回用户正在输入的draft
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
  // 根据编辑状态安排自动保存,定时调用save
  useEffect(() => {
    if (!dirty || failed || blocked || isPending) return
    const timer = setTimeout(save, flushRequested || leaving ? 0 : 800)
    return () => clearTimeout(timer)
  }, [dirty, failed, blocked, isPending, flushRequested, leaving, save])
  // 未保存成功时,拦截页面跳转, 保存完成后,继续之前被拦截的页面跳转
  useEffect(() => {
    if (blocker.state === 'blocked' && !dirty && !isPending) blocker.proceed()
  }, [blocker, dirty, isPending])
  // 刷新或关闭页面时,提示可能丢失修改
  useEffect(() => {
    if (!dirty && !isPending) return
    const warnBeforeClose = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warnBeforeClose)
    return () => window.removeEventListener('beforeunload', warnBeforeClose)
  }, [dirty, isPending])

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
