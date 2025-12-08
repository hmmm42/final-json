import type { MouseEvent as ReactMouseEvent } from 'react'
import { PackageOpen, Package, Trash2 } from 'lucide-react'
import { getType, isJsonString } from '../lib/json'
import type { JSONValue, JSONArray, JSONObject, Path } from '../types/json'

export type JsonNodeProps = {
  keyName?: string
  value: JSONValue
  path: Path
  level?: number
  theme: 'dark' | 'light'
  selectedPath: Path | null
  onSelect: (path: Path) => void
  onDelete: (path: Path) => void
  onUpdate: (path: Path, val: JSONValue, actionName: string) => void
}

export function JsonNode({
  keyName,
  value,
  path,
  level = 0,
  theme,
  selectedPath,
  onSelect,
  onDelete,
  onUpdate,
}: JsonNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const type = getType(value)
  const isExpandable = type === 'object' || type === 'array'
  const isStringifiedJson = type === 'string' && isJsonString(value as string)

  const handleToggle = () => setExpanded(!expanded)
  const handleDelete = (e: ReactMouseEvent) => { e.stopPropagation(); onDelete(path) }
  const handleStringify = (e: ReactMouseEvent) => { e.stopPropagation(); onUpdate(path, JSON.stringify(value), '序列化节点') }
  const handleParseString = (e: ReactMouseEvent) => {
    e.stopPropagation()
    try {
      const parsed = JSON.parse(value as string) as JSONValue
      onUpdate(path, parsed, '反序列化节点')
    } catch (err) { }
  }

  const renderValue = () => {
    if (value === null) return <span className="text-gray-400">null</span>
    if (typeof value === 'boolean') return <span className="text-purple-400 font-bold">{String(value)}</span>
    if (typeof value === 'number') return <span className="text-blue-400">{String(value)}</span>
    if (typeof value === 'string') return <span className="text-green-400">"{value}"</span>
    return null
  }

  const isSelected = selectedPath && JSON.stringify(selectedPath) === JSON.stringify(path)
  const keyColor = theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700'

  return (
    <div className={`pl-4 ${level > 0 ? (theme === 'dark' ? 'border-l border-gray-700/30' : 'border-l border-gray-300/40') : ''} font-mono text-sm`} onClick={() => onSelect(path)}>
      <div className={`flex items-center group py-0.5 ${isSelected ? 'bg-sky-500/10 border border-sky-500/30 rounded' : (theme === 'dark' ? 'hover:bg-gray-700/20' : 'hover:bg-gray-200')}`}>
        {isExpandable ? (
          <button onClick={handleToggle} className="mr-1 text-gray-500 hover:text-white w-4 text-center">{expanded ? '-' : '+'}</button>
        ) : (
          <span className="w-5 inline-block"></span>
        )}

        {keyName !== undefined && (
          <span className={`mr-2 ${keyColor}`}>"{keyName}":</span>
        )}

        {isExpandable ? (
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-xs flex items-center gap-2`}>
            <span className="text-gray-500">-</span>
            {type === 'array' ? `Array[${(value as JSONArray).length}]` : `Object{${Object.keys(value as JSONObject).length}}`}
            {!expanded && <span className="ml-2 opacity-50">...</span>}
          </span>
        ) : (
          renderValue()
        )}

        <div className="ml-auto hidden group-hover:flex items-center gap-2 pr-2">
          {isStringifiedJson && (
            <button onClick={handleParseString} title="反序列化 (Unpack JSON String)" className="p-1 hover:bg-green-900/50 text-green-500 rounded">
              <PackageOpen size={14} />
            </button>
          )}
          {isExpandable && (
            <button onClick={handleStringify} title="序列化 (Pack to String)" className="p-1 hover:bg-yellow-900/50 text-yellow-500 rounded">
              <Package size={14} />
            </button>
          )}
          <button onClick={handleDelete} title="删除节点" className="p-1 hover:bg-red-900/50 text-red-500 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpandable && expanded && (
        <div className="ml-2">
          {type === 'array'
            ? (value as JSONArray).map((v, i) => (
              <JsonNode
                key={i}
                keyName={undefined}
                value={v}
                path={[...path, i]}
                level={level + 1}
                theme={theme}
                selectedPath={selectedPath}
                onSelect={onSelect}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))
            : Object.entries(value as JSONObject).map(([k, v]) => (
              <JsonNode
                key={k}
                keyName={k}
                value={v}
                path={[...path, k]}
                level={level + 1}
                theme={theme}
                selectedPath={selectedPath}
                onSelect={onSelect}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
        </div>
      )}

      {isExpandable && expanded && (
        <div className="ml-5 text-gray-500">{type === 'array' ? ']' : '}'}</div>
      )}
    </div>
  )
}

import { useState } from 'react'
