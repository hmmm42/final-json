import type { JSONValue } from '../types/json'

export const smartParse = (input: string): JSONValue | null => {
  if (!input) return null
  let fixed = input.trim()

  try {
    return JSON.parse(fixed) as JSONValue
  } catch { }

  if (!fixed.startsWith('{') && !fixed.startsWith('[') && fixed.includes(':')) {
    fixed = `{${fixed}}`
  }
  fixed = fixed.replace(/,\s*([\]}])/g, '$1')

  try {
    return JSON.parse(fixed) as JSONValue
  } catch (e) {
    throw new Error('无法自动修复，请检查语法错误。')
  }
}

export const getType = (value: JSONValue) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

export const isJsonString = (str: string) => {
  if (typeof str !== 'string') return false
  const trimmed = str.trim()
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  )
}

export const getLineCol = (text: string, index: number) => {
  const lines = text.substring(0, index).split('\n')
  const line = lines.length
  const col = lines[lines.length - 1].length + 1
  return { line, col }
}
