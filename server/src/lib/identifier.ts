// use project key and issues number
export function parseIdentifier(identifier: string) {
  const match = /^([A-Za-z]+)-(\d+)$/.exec(identifier)
  if (!match) {
    return null
  }
  return { projectKey: match[1], number: Number(match[2]) }
}
