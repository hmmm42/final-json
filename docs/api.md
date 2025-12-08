# 函数 API 文档

## json.ts
### smartParse(input: string): JSONValue | null
- 输入：任意字符串
- 输出：JSONValue；可自动尝试修复常见语法
- 示例：
```ts
smartParse('{"a":1}') // { a: 1 }
smartParse('a:1') // { a: 1 }
```

### getType(value: JSONValue): 'null' | 'array' | string
- 输入：JSONValue
- 输出：类型字符串

### isJsonString(str: string): boolean
- 判断字符串是否形如 JSON

### getLineCol(text: string, index: number): { line: number; col: number }
- 将线性索引转为行列

## mutate.ts
### applyMutation(source: JSONValue, path: Path, action: 'delete'|'update', newValue?: JSONValue): JSONValue
- 对任意对象/数组按路径执行变更并返回新副本
- 示例：
```ts
applyMutation({a:{b:1}}, ['a','b'], 'update', 2) // {a:{b:2}}
applyMutation({a:[1,2,3]}, ['a',1], 'delete') // {a:[1,3]}
```

## versions.ts
### pushVersion(versions: Version[], content: string, cap?: number): Version[]
- 将新快照压入版本栈，跳过与栈顶相同内容

### canUndo(versions: Version[]): boolean
- 是否可撤回

### undoLastVersion(versions: Version[]): { versions: Version[]; restored?: Version }
- 弹出栈顶，返回上一版本

### isMajorChange(prevContent: string, nextContent: string): boolean
- 判断是否为“大改动”（长度比例 > 0.3 或根结构变化）

## 组件
### JsonNode(props)
- 入参：
  - keyName?: string
  - value: JSONValue
  - path: Path
  - level?: number
  - theme: 'dark'|'light'
  - selectedPath: Path|null
  - onSelect(path)
  - onDelete(path)
  - onUpdate(path, val, actionName)
- 作用：渲染 JSON 树节点，支持展开、删除、序列化/反序列化操作
