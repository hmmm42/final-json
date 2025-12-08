import type { JSONValue, JSONArray, JSONObject, Path } from '../types/json'

export type MutationAction = 'delete' | 'update'

export const applyMutation = (
  source: JSONValue,
  path: Path,
  action: MutationAction,
  newValue: JSONValue | null = null,
): JSONValue => {
  if (!(Array.isArray(source) || typeof source === 'object')) return source
  const newData: any = Array.isArray(source) ? [...(source as JSONArray)] : { ...(source as JSONObject) }

  let current: any = newData
  for (let i = 0; i < path.length - 1; i++) {
    const key: any = path[i]
    current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] }
    current = current[key]
  }
  const lastKey: any = path[path.length - 1]

  if (action === 'delete') {
    if (Array.isArray(current)) current.splice(parseInt(lastKey, 10), 1)
    else delete current[lastKey]
  } else if (action === 'update') {
    current[lastKey] = newValue as any
  }

  return newData as JSONValue
}
