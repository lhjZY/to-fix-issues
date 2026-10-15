import { useQuery } from '@tanstack/react-query'
import { client } from '../lib/api.ts'

// 获取单条 issue，identifier 形如 'TJ-36'
export function useIssue(identifier: string) {
  return useQuery({
    queryKey: ['issue', identifier],
    queryFn: async () => {
      const res = await client.api.issues[':identifier'].$get({
        param: { identifier },
      })
      if (!res.ok) {
        throw new Error(`Failed to load issue: ${res.status}`)
      }
      return res.json()
    },
  })
}
