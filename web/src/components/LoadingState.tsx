import { LoaderCircle } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-fg-subtle">
      <LoaderCircle className="size-4 animate-spin" />
      加载中…
    </div>
  )
}
