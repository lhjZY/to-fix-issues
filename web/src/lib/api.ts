import type { AppType } from '@raven/server'
import { hc } from 'hono/client'

// 类型安全的接口客户端：路径、参数、返回值的类型都从后端路由推导
// '/' 表示请求当前域名，开发时由 Vite 代理转发到后端
export const client = hc<AppType>('/')
