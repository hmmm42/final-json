export const extractCoreJsonString = (raw: string): string | null => {
  if (!raw) return null
  // Try direct JSON first
  try {
    JSON.parse(raw)
    return raw
  } catch {}

  // Find first parsable {...} or [...] substring
  const pattern = /(\{[\s\S]*?\}|\[[\s\S]*?\])/g
  const candidates = raw.match(pattern) || []
  for (const c of candidates) {
    try {
      JSON.parse(c)
      return c
    } catch {}
  }

  // Heuristic: trim prefix/suffix until parsable
  let start = raw.indexOf('{')
  let end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    for (let i = start; i >= 0; i--) {
      for (let j = end; j < raw.length; j++) {
        const sub = raw.slice(i, j + 1)
        try { JSON.parse(sub); return sub } catch {}
      }
    }
  }
  start = raw.indexOf('[')
  end = raw.lastIndexOf(']')
  if (start !== -1 && end !== -1 && end > start) {
    for (let i = start; i >= 0; i--) {
      for (let j = end; j < raw.length; j++) {
        const sub = raw.slice(i, j + 1)
        try { JSON.parse(sub); return sub } catch {}
      }
    }
  }
  return null
}
