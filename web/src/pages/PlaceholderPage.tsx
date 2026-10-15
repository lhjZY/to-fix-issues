type PlaceholderPageProps = {
  title: string
}

// 暂未实现的页面
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-2 text-fg-muted">这个页面暂未实现。</p>
    </div>
  )
}
