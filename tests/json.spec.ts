import { describe, it, expect } from 'vitest'
import { smartParse, getType, isJsonString, getLineCol } from '../src/lib/json'

describe('json helpers', () => {
  it('smartParse parses valid JSON', () => {
    expect(smartParse('{"a":1}')).toEqual({ a: 1 })
  })

  it('smartParse fixes missing braces', () => {
    expect(smartParse('a:1')).toEqual({ a: 1 })
  })

  it('getType works', () => {
    expect(getType(null)).toBe('null')
    expect(getType([1, 2])).toBe('array')
    expect(getType({})).toBe('object')
    expect(getType('x')).toBe('string')
  })

  it('isJsonString detects JSON-like strings', () => {
    expect(isJsonString('{"a":1}')).toBe(true)
    expect(isJsonString('[1,2]')).toBe(true)
    expect(isJsonString('not')).toBe(false)
  })

  it('getLineCol returns correct position', () => {
    const text = 'aa\nbb\ncc'
    const idx = text.indexOf('c')
    const { line, col } = getLineCol(text, idx)
    expect(line).toBe(3)
    expect(col).toBe(1)
  })
})
