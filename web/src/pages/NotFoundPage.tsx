import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">页面不存在</h1>
      <Link to="/" className="mt-2 inline-block text-brand hover:underline">
        回到首页
      </Link>
    </div>
  )
}
