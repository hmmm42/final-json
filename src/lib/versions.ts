export type Version = { id: string; content: string; timestamp: number }

export const pushVersion = (versions: Version[], content: string, cap = 20): Version[] => {
  const top = versions[versions.length - 1]
  if (top && top.content === content) return versions
  const next = [...versions, { id: Date.now().toString(), content, timestamp: Date.now() }]
  return next.slice(-cap)
}

export const canUndo = (versions: Version[]) => versions.length > 1

export const undoLastVersion = (versions: Version[]): { versions: Version[]; restored?: Version } => {
  if (!canUndo(versions)) return { versions }
  const next = versions.slice(0, -1)
  const last = next[next.length - 1]
  return { versions: next, restored: last }
}

export const isMajorChange = (prevContent: string, nextContent: string): boolean => {
  const prevLen = prevContent.length
  const newLen = nextContent.length
  const lenDiffRatio = Math.abs(newLen - prevLen) / Math.max(1, prevLen)
  if (lenDiffRatio > 0.3) return true
  try {
    const prevObj = JSON.parse(prevContent)
    const nextObj = JSON.parse(nextContent)
    if (Array.isArray(prevObj) && Array.isArray(nextObj)) {
      return Math.abs(prevObj.length - nextObj.length) >= 1
    }
    if (prevObj && nextObj && typeof prevObj === 'object' && typeof nextObj === 'object') {
      return Math.abs(Object.keys(prevObj).length - Object.keys(nextObj).length) >= 1
    }
  } catch { }
  return false
}
