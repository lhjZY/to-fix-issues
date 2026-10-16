import { useQuery } from '@tanstack/react-query'
import { client } from '../lib/api.ts'
import { HttpError } from '../lib/http-error.ts'

export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const res = await client.api.labels.$get()
      if (!res.ok) throw new HttpError(res.status)
      return res.json()
    },
  })
}
