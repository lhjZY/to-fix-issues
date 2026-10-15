import type { CreateIssueInput } from '@raven/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '../lib/api.ts'
import { HttpError } from '../lib/http-error.ts'

// 在项目中新建 issue
export function useCreateIssue(projectKey: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateIssueInput) => {
      const res = await client.api.projects[':key'].issues.$post({
        param: { key: projectKey },
        json: input,
      })
      if (!res.ok) {
        throw new HttpError(res.status)
      }
      return res.json()
    },
    // 新建成功后，让这个项目的列表缓存失效，列表会自动重新请求
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['issues', projectKey] })
    },
  })
}
