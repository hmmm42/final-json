import { describe, it, expect } from 'vitest'
import { pushVersion, canUndo, undoLastVersion, isMajorChange } from '../src/lib/versions'

describe('versions', () => {
  it('pushVersion appends when content differs', () => {
    const base = [{ id: '1', content: 'A', timestamp: 1 }]
    const res = pushVersion(base as any, 'B')
    expect(res.length).toBe(2)
  })

  it('canUndo requires >1 versions', () => {
    expect(canUndo([{ id: '1', content: 'A', timestamp: 1 } as any])).toBe(false)
    expect(canUndo([{ id: '1', content: 'A', timestamp: 1 } as any, { id: '2', content: 'B', timestamp: 2 } as any])).toBe(true)
  })

  it('undoLastVersion returns previous and restored', () => {
    const start = [{ id: '1', content: 'A', timestamp: 1 } as any, { id: '2', content: 'B', timestamp: 2 } as any]
    const { versions, restored } = undoLastVersion(start)
    expect(versions.length).toBe(1)
    expect(restored?.content).toBe('A')
  })

  it('isMajorChange detects large diffs and shape changes', () => {
    expect(isMajorChange('X', 'X'.repeat(100))).toBe(true)
    expect(isMajorChange('{"a":1}', '{"a":1,"b":2}')).toBe(true)
    expect(isMajorChange('[1]', '[1,2]')).toBe(true)
  })
})
