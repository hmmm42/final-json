import { describe, it, expect } from 'vitest'
import { applyMutation } from '../src/lib/mutate'

describe('applyMutation', () => {
  it('updates object property', () => {
    const src = { a: { b: 1 } }
    const res = applyMutation(src, ['a', 'b'], 'update', 2)
    expect(res).toEqual({ a: { b: 2 } })
    expect(src).toEqual({ a: { b: 1 } })
  })

  it('deletes array element', () => {
    const src = { a: [1, 2, 3] }
    const res = applyMutation(src, ['a', 1], 'delete')
    expect(res).toEqual({ a: [1, 3] })
  })
})
