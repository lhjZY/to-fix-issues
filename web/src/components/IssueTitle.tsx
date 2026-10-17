type IssueTitleProps = {
  value: string
  error: string
  onChange: (value: string) => void
  onBlur: () => void
  onComposingChange: (composing: boolean) => void
}

export function IssueTitle({ value, error, onChange, onBlur, onComposingChange }: IssueTitleProps) {
  return (
    <div>
      <textarea
        rows={1}
        aria-label="Issue 标题"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'issue-title-error' : undefined}
        className="field-sizing-content w-full resize-none bg-transparent text-2xl leading-snug font-semibold outline-none placeholder:text-fg-subtle"
        placeholder="Issue title"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\n/g, ' '))}
        onBlur={onBlur}
        onCompositionStart={() => onComposingChange(true)}
        onCompositionEnd={() => onComposingChange(false)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
          if (event.key === 'Enter') {
            event.preventDefault()
            onBlur()
            document.getElementById('issue-description')?.focus()
          }
        }}
      />
      {error && (
        <p id="issue-title-error" role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
