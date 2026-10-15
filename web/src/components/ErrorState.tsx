type ErrorStateProps = {
  onRetry: () => void
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <p className="text-fg-muted">加载失败，请检查网络或稍后重试。</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-line px-3 py-1.5 hover:bg-surface"
      >
        重试
      </button>
    </div>
  )
}
