import { QueryClient } from '@tanstack/react-query'
import { HttpError } from './http-error.ts'

// 整个应用共用一个 QueryClient，所有请求结果都缓存在这里
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 4xx（如 404）说明请求本身有问题，重试也没用；其他错误最多重试 3 次
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})
