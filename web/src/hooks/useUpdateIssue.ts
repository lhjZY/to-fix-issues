import type { Issue, Label, UpdateIssueInput } from '@raven/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '../lib/api.ts'
import { HttpError } from '../lib/http-error.ts'

export function useUpdateIssue(identifier: string, projectKey: string) {
  const queryClient = useQueryClient()
  const issueKey = ['issue', identifier]
  const issuesKey = ['issues', projectKey]

  return useMutation({
    mutationFn: async (input: UpdateIssueInput) => {
      const res = await client.api.issues[':identifier'].$patch({
        param: { identifier },
        json: input,
      })
      if (!res.ok) {
        throw new HttpError(res.status)
      }
      return res.json()
    },
    onMutate: async (input) => {
      // 先取消旧查询，避免它们稍后返回时覆盖乐观更新。
      await Promise.all([
        queryClient.cancelQueries({ queryKey: issueKey }),
        queryClient.cancelQueries({ queryKey: issuesKey }),
      ])

      const previousIssue = queryClient.getQueryData<Issue>(issueKey)
      const previousIssues = queryClient.getQueryData<Issue[]>(issuesKey)
      const { labelIds, ...fields } = input
      const selectedLabels =
        labelIds === undefined
          ? undefined
          : queryClient
              .getQueryData<Label[]>(['labels'])
              ?.filter((label) => labelIds.includes(label.id))
      // API 传 ID，界面需要完整标签对象；没有标签目录时等待服务器结果。
      const optimisticFields =
        selectedLabels === undefined ? fields : { ...fields, labels: selectedLabels }

      queryClient.setQueryData<Issue>(issueKey, (old) =>
        old ? { ...old, ...optimisticFields } : old,
      )
      queryClient.setQueryData<Issue[]>(issuesKey, (old) =>
        old?.map((issue) =>
          issue.identifier === identifier ? { ...issue, ...optimisticFields } : issue,
        ),
      )

      return { previousIssue, previousIssues }
    },
    onError: (_error, _input, snapshot) => {
      if (snapshot?.previousIssue) {
        queryClient.setQueryData(issueKey, snapshot.previousIssue)
      }
      if (snapshot?.previousIssues) {
        queryClient.setQueryData(issuesKey, snapshot.previousIssues)
      }
    },
    onSettled: () => {
      // 无论成功还是失败，最后都以服务器数据为准。
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: issueKey }),
        queryClient.invalidateQueries({ queryKey: issuesKey }),
      ])
    },
  })
}
