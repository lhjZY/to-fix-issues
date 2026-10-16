import type { UpdateIssueInput } from '@raven/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '../lib/api.ts'
import { HttpError } from '../lib/http-error.ts'

export function useUpdateIssue(identifier: string, projectKey: string) {
  const queryClient = useQueryClient()

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
    onSuccess: () => {
      // 详情和列表各有一份缓存，两份都要通知。
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['issue', identifier] }),
        queryClient.invalidateQueries({ queryKey: ['issues', projectKey] }),
      ])
    },
  })
}
