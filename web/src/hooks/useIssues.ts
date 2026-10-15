import { useQuery } from '@tanstack/react-query'
import { client } from '../lib/api.ts'
import { HttpError } from '../lib/http-error.ts'

// 获取项目下的全部 issue
export function useIssues(projectKey: string) {
  return useQuery({
    // 缓存的"名字"：项目不同，缓存也不同
    queryKey: ['issues', projectKey],
    queryFn: async () => {
      const res = await client.api.projects[':key'].issues.$get({
        param: { key: projectKey },
      })
      if (!res.ok) {
        throw new HttpError(res.status)
      }
      return res.json()
    },
  })
}
