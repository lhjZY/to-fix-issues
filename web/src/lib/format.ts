const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

export function formatShortDate(isoString: string): string {
  return shortDateFormatter.format(new Date(isoString))
}
