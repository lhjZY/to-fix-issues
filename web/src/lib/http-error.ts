// 请求失败时抛出的错误，带上 HTTP 状态码，方便判断是"不存在"还是"服务器出错"
export class HttpError extends Error {
  status: number

  constructor(status: number) {
    super(`Request failed with status ${status}`)
    this.status = status
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404
}
