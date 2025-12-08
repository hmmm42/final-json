import { describe, it, expect } from 'vitest'
import { extractCoreJsonString } from '../src/lib/stringFix'

describe('extractCoreJsonString', () => {
  it('parses pure json', () => {
    expect(extractCoreJsonString('{"a":1}')).toBe('{"a":1}')
  })

  it('extracts json from prefixed content', () => {
    const s = 'prefix "key": "{\n  \"a\": 1\n}" suffix'
    const unescaped = '"{\n  \"a\": 1\n}"'
    const core = extractCoreJsonString(unescaped.replace(/^"|"$/g,''))
    expect(core && JSON.parse(core)).toEqual({ a: 1 })
  })

  it('extracts from noisy string', () => {
    const s = 'noise before {"a":1,"b":[1,2]} and after'
    const core = extractCoreJsonString(s)
    expect(core && JSON.parse(core)).toEqual({ a:1, b:[1,2] })
  })
})
