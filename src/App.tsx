import { useState, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  Braces,
  Trash2,
  Copy,
  Maximize2,
  Minimize2,
  History,
  Wrench,
  PackageOpen,
  Package,
  Check,
  AlertCircle,
  FileJson,
  LocateFixed,
  Quote,
  ArrowDown,
  Link,
  Unlink,
  Sun,
  Moon,
  Activity
} from 'lucide-react';

// --- Helper Functions ---

type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];
type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type ScrollSource = 'json' | 'string' | 'visualizer';
type HistoryItem = { id: string; action: string; content: string; timestamp: Date; preview: string };
type ErrorInfo = { message: string; index: number; line?: number; col?: number; source: 'json' | 'string' };

const smartParse = (input: string): JSONValue | null => {
  if (!input) return null;
  let fixed = input.trim();

  try {
    return JSON.parse(fixed) as JSONValue;
  } catch (e) {
    // Continue
  }

  // Common fixes
  if (!fixed.startsWith('{') && !fixed.startsWith('[') && fixed.includes(':')) {
    fixed = `{${fixed}}`;
  }
  fixed = fixed.replace(/,\s*([\]}])/g, '$1');

  try {
    return JSON.parse(fixed) as JSONValue;
  } catch (e) {
    throw new Error("无法自动修复，请检查语法错误。");
  }
};

const getType = (value: JSONValue) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const isJsonString = (str: string) => {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

const getLineCol = (text: string, index: number) => {
  const lines = text.substring(0, index).split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
};

// --- Components ---

const JsonNode = ({
  keyName,
  value,
  path,
  onDelete,
  onUpdate,
  level = 0
}: {
  keyName?: string;
  value: JSONValue;
  path: (string | number)[];
  onDelete: (path: (string | number)[]) => void;
  onUpdate: (path: (string | number)[], val: JSONValue, actionName: string) => void;
  level?: number;
}) => {
  const [expanded, setExpanded] = useState(true);
  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';
  const isStringifiedJson = type === 'string' && isJsonString(value as string);

  const handleToggle = () => setExpanded(!expanded);

  const handleDelete = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onDelete(path);
  };

  const handleStringify = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onUpdate(path, JSON.stringify(value), '序列化节点');
  };

  const handleParseString = (e: ReactMouseEvent) => {
    e.stopPropagation();
    try {
      const parsed = JSON.parse(value as string) as JSONValue;
      onUpdate(path, parsed, '反序列化节点');
    } catch (err) {
      console.error(err);
    }
  };

  const renderValue = () => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (typeof value === 'boolean') return <span className="text-purple-400 font-bold">{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-blue-400">{value}</span>;
    if (typeof value === 'string') return <span className="text-green-400">"{value}"</span>;
    return null;
  };

  return (
    <div className={`pl-4 ${level > 0 ? 'border-l border-gray-700/30' : ''} font-mono text-sm`}>
      <div className="flex items-center group py-0.5">
        {isExpandable ? (
          <button onClick={handleToggle} className="mr-1 text-gray-500 hover:text-white w-4 text-center">
            {expanded ? '-' : '+'}
          </button>
        ) : (
          <span className="w-5 inline-block"></span>
        )}

        {keyName !== undefined && (
          <span className="mr-2 text-red-400">"{keyName}":</span>
        )}

        {isExpandable ? (
          <span className="text-gray-400 text-xs">
            {type === 'array' ? `Array[${(value as JSONArray).length}]` : `Object{${Object.keys(value as JSONObject).length}}`}
            {!expanded && <span className="ml-2 opacity-50">...</span>}
          </span>
        ) : (
          renderValue()
        )}

        <div className="ml-auto hidden group-hover:flex items-center gap-2 pr-2">
          {isStringifiedJson && (
            <button
              onClick={handleParseString}
              title="反序列化 (Unpack JSON String)"
              className="p-1 hover:bg-green-900/50 text-green-500 rounded"
            >
              <PackageOpen size={14} />
            </button>
          )}

          {isExpandable && (
            <button
              onClick={handleStringify}
              title="序列化 (Pack to String)"
              className="p-1 hover:bg-yellow-900/50 text-yellow-500 rounded"
            >
              <Package size={14} />
            </button>
          )}

          <button
            onClick={handleDelete}
            title="删除节点"
            className="p-1 hover:bg-red-900/50 text-red-500 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpandable && expanded && (
        <div className="ml-2">
          {Object.entries(value as JSONObject | JSONArray).map(([k, v]) => (
            <JsonNode
              key={k}
              keyName={type === 'array' ? undefined : k}
              value={v}
              path={[...path, k]}
              onDelete={onDelete}
              onUpdate={onUpdate}
              level={level + 1}
            />
          ))}
        </div>
      )}

      {isExpandable && expanded && (
        <div className="ml-5 text-gray-500">
          {type === 'array' ? ']' : '}'}
        </div>
      )}
    </div>
  );
};


export default function App() {
  const [jsonInput, setJsonInput] = useState('{\n  "key": {\n    "test": 1,\n    "jsonStr": "{\\\"inner\\\": true}"\n  }\n}');
  const [stringInput, setStringInput] = useState('"{\\\"key\\\":{\\\"test\\\":1,\\\"jsonStr\\\":\\\"{\\\\\\\"inner\\\\\\\": true}\\\"}}"');

  const [parsedData, setParsedData] = useState<JSONValue | null>(null);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'error-json' | 'error-string'>('synced');

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState('');

  const jsonTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const stringTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const visualizerRef = useRef<HTMLDivElement | null>(null);

  const scrollLock = useRef<ScrollSource | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // --- Core Logic: Initialize ---
  useEffect(() => {
    try {
      const data = JSON.parse(jsonInput);
      setParsedData(data);
    } catch (e) {
      // Initial could be invalid
    }
  }, []);

  // --- History Management ---
  const addToHistory = (actionType: string, content: string) => {
    if (!content || !content.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      action: actionType,
      content: content,
      timestamp: new Date(),
      preview: content.slice(0, 40).replace(/\n/g, ' ') + '...'
    };

    setHistoryList((prev) => {
      // Keep max 30 items
      const newList = [newItem, ...prev];
      return newList.slice(0, 30);
    });
  };

  const handlePaste = () => {
    if (parsedData) {
      addToHistory('覆盖前快照 (Paste)', jsonInput);
    }
  };

  const restoreHistory = (item: HistoryItem) => {
    handleJsonChange(item.content);
    showNotification(`已恢复: ${item.action}`);
  };

  // --- Sync Scroll Logic ---
  const handleScroll = (source: ScrollSource) => {
    if (scrollLock.current && scrollLock.current !== source) return;

    scrollLock.current = source;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      scrollLock.current = null;
    }, 100);

    const refs: Record<ScrollSource, HTMLElement | null> = {
      json: jsonTextareaRef.current,
      string: stringTextareaRef.current,
      visualizer: visualizerRef.current
    };

    const sourceEl = refs[source];
    if (!sourceEl) return;

    const percentage = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight);

    (Object.entries(refs) as [ScrollSource, HTMLElement | null][]).forEach(([key, el]) => {
      if (key !== source && el) {
        const targetScrollTop = percentage * (el.scrollHeight - el.clientHeight);
        el.scrollTop = targetScrollTop;
      }
    });
  };

  // --- Change Handlers ---

  const handleJsonChange = (val: string) => {
    setJsonInput(val);

    if (!val.trim()) {
      setParsedData(null);
      setErrorInfo(null);
      setSyncStatus('synced');
      setStringInput('');
      return;
    }

    try {
      const data = JSON.parse(val) as JSONValue;
      setParsedData(data);
      setErrorInfo(null);

      const minified = JSON.stringify(data);
      const escaped = JSON.stringify(minified);
      setStringInput(escaped.slice(1, -1));
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error-json');
      setParsedData(null);

      let message = 'JSON 解析错误';
      let index = -1;
      if (e instanceof Error) {
        message = e.message;
        const match = e.message.match(/position\s+(\d+)/);
        index = match ? parseInt(match[1], 10) : -1;
      }
      let errorDetails: ErrorInfo = { message, index, source: 'json' };
      if (index !== -1) {
        const { line, col } = getLineCol(val, index);
        errorDetails = { ...errorDetails, line, col };
      }
      setErrorInfo(errorDetails);
    }
  };

  const handleStringChange = (val: string) => {
    setStringInput(val);

    if (!val.trim()) {
      setParsedData(null);
      setErrorInfo(null);
      setSyncStatus('synced');
      setJsonInput('');
      return;
    }

    try {
      let unescaped: string;
      try {
        const tmp = JSON.parse(val);
        if (typeof tmp !== 'string') throw new Error('Not a string');
        unescaped = tmp;
      } catch (e) {
        unescaped = JSON.parse(`"${val}"`);
      }

      const obj = JSON.parse(unescaped) as JSONValue;
      setParsedData(obj);
      setErrorInfo(null);
      setJsonInput(JSON.stringify(obj, null, 2));
      setSyncStatus('synced');

    } catch (e) {
      setSyncStatus('error-string');
      setErrorInfo({ message: "无效的转义字符串或内部 JSON 格式错误", index: -1, source: 'string' });
      setParsedData(null);
    }
  };

  const handleSmartFix = () => {
    addToHistory('智能修复前', jsonInput);
    try {
      if (syncStatus === 'error-string') {
        showNotification("只能对标准 JSON 进行智能修复");
        return;
      }
      const fixed = smartParse(jsonInput);
      const formatted = JSON.stringify(fixed, null, 2);

      setJsonInput(formatted);
      setParsedData(fixed);

      const minified = JSON.stringify(fixed);
      const escaped = JSON.stringify(minified).slice(1, -1);
      setStringInput(escaped);

      setErrorInfo(null);
      setSyncStatus('synced');
      showNotification("已智能修复格式");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showNotification("无法修复: " + msg);
    }
  };

  const handleFormat = () => {
    if (parsedData) {
      addToHistory('格式化前', jsonInput);
      const formatted = JSON.stringify(parsedData, null, 2);
      setJsonInput(formatted);
      const minified = JSON.stringify(parsedData);
      const escaped = JSON.stringify(minified).slice(1, -1);
      setStringInput(escaped);
    }
  };

  const handleMinify = () => {
    if (parsedData) {
      addToHistory('压缩前', jsonInput);
      const minified = JSON.stringify(parsedData);
      setJsonInput(minified);
      const escaped = JSON.stringify(minified).slice(1, -1);
      setStringInput(escaped);
    }
  };

  const locateError = () => {
    if (errorInfo && errorInfo.index !== -1) {
      if (errorInfo.source === 'json' && jsonTextareaRef.current) {
        jsonTextareaRef.current.focus();
        jsonTextareaRef.current.setSelectionRange(errorInfo.index, errorInfo.index + 1);
      }
    }
  };

  const updateDataAtPath = (
    path: (string | number)[],
    action: 'delete' | 'update',
    newValue: JSONValue | null = null,
    actionName: string = '修改节点'
  ) => {
    if (!parsedData) return;
    if (!(Array.isArray(parsedData) || typeof parsedData === 'object')) return;

    addToHistory(`${actionName} (${path.join('.')})`, jsonInput);

    const newData: JSONObject | JSONArray = Array.isArray(parsedData)
      ? [...(parsedData as JSONArray)]
      : { ...(parsedData as JSONObject) };

    let current: any = newData as any;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i] as any;
      current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
      current = current[key];
    }
    const lastKey = path[path.length - 1] as any;

    if (action === 'delete') {
      if (Array.isArray(current)) current.splice(parseInt(lastKey, 10), 1);
      else delete current[lastKey];
    } else if (action === 'update') {
      current[lastKey] = newValue as any;
    }

    setParsedData(newData);
    const formatted = JSON.stringify(newData, null, 2);
    setJsonInput(formatted);
    const minified = JSON.stringify(newData);
    setStringInput(JSON.stringify(minified).slice(1, -1));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const clearAll = () => {
    addToHistory('清空前', jsonInput);
    setJsonInput('');
    setStringInput('');
  };

  return (
    <div className={`h-screen w-full flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200 overflow-hidden`}>

      {/* Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? '#1f2937' : '#f3f4f6'}; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'}; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#6b7280' : '#9ca3af'}; 
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* Header */}
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-2">
          <Wrench className="text-blue-500" />
          <h1 className="font-bold text-lg hidden sm:block">JSON 全能工匠</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-700/50 rounded-lg p-1 gap-1 mr-2">
            <button onClick={handleSmartFix} className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition">
              <Check size={14} /> 智能修复
            </button>
          </div>

          <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded hover:bg-opacity-80 transition flex items-center gap-1 ${showHistory ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
            <History size={18} />
            {historyList.length > 0 && <span className="text-[10px] bg-red-500 text-white rounded-full px-1">{historyList.length}</span>}
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1"></div>

          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Column: Input Editors (Split View) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-700/50">

          {/* Global Toolbar for Inputs */}
          <div className={`h-9 flex items-center justify-between px-4 text-xs font-mono border-b ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex items-center gap-2 opacity-60">
              <ArrowDown size={12} /> 输入任意一侧即可同步
            </div>
            <div className="flex gap-2">
              <button onClick={handleFormat} className="hover:text-blue-400 flex items-center gap-1"><Maximize2 size={12} /> 格式化</button>
              <button onClick={handleMinify} className="hover:text-blue-400 flex items-center gap-1"><Minimize2 size={12} /> 压缩</button>
              <button onClick={clearAll} className="hover:text-red-400 flex items-center gap-1"><Trash2 size={12} /> 清空</button>
            </div>
          </div>

          {/* Top: JSON Editor */}
          <div className="flex-1 relative flex flex-col min-h-0">
            <div className={`px-2 py-1 text-xs font-bold flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800 text-blue-400' : 'bg-gray-200 text-blue-600'}`}>
              <span className="flex items-center gap-1"><Braces size={12} /> 标准 JSON</span>
              <button onClick={() => { navigator.clipboard.writeText(jsonInput); showNotification("已复制 JSON") }} className="hover:text-white"><Copy size={12} /></button>
            </div>
            <textarea
              ref={jsonTextareaRef}
              onScroll={() => handleScroll('json')}
              onPaste={handlePaste}
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 z-10 custom-scrollbar ${theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'}`}
              placeholder="输入标准 JSON..."
              spellCheck={false}
            />
            {syncStatus === 'error-json' && (
              <div className="absolute bottom-2 right-2 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/50 backdrop-blur z-20">
                语法错误
              </div>
            )}
          </div>

          {/* Divider / Sync Indicator */}
          <div className={`h-1 flex items-center justify-center relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className={`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm z-30
                ${syncStatus === 'synced' ? 'bg-green-600 text-white border-green-500' : 'bg-yellow-600 text-white border-yellow-500'}`}>
              {syncStatus === 'synced' ? <Link size={10} /> : <Unlink size={10} />}
            </div>
          </div>

          {/* Bottom: String Editor */}
          <div className="flex-1 relative flex flex-col min-h-0 border-t border-gray-700/50">
            <div className={`px-2 py-1 text-xs font-bold flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800 text-purple-400' : 'bg-gray-200 text-purple-600'}`}>
              <span className="flex items-center gap-1"><Quote size={12} /> 转义字符串 (Escaped String)</span>
              <button onClick={() => { navigator.clipboard.writeText(stringInput); showNotification("已复制转义字符串") }} className="hover:text-white"><Copy size={12} /></button>
            </div>
            <textarea
              ref={stringTextareaRef}
              onScroll={() => handleScroll('string')}
              value={stringInput}
              onChange={(e) => handleStringChange(e.target.value)}
              className={`flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 leading-relaxed text-purple-300/90 custom-scrollbar ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}
              placeholder="输入转义后的字符串..."
              spellCheck={false}
            />
            {syncStatus === 'error-string' && (
              <div className="absolute bottom-2 right-2 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs border border-red-500/50 backdrop-blur z-20">
                转义/JSON 格式错误
              </div>
            )}
          </div>

          {/* Error Panel */}
          {errorInfo && (
            <div className="bg-red-900/90 text-red-100 p-2 text-xs border-t border-red-700 flex flex-col gap-1 backdrop-blur-sm shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={14} />
                  <span>{errorInfo.source === 'json' ? 'JSON 语法错误' : '字符串解析错误'}: {errorInfo.message}</span>
                </div>
                {errorInfo.index !== -1 && errorInfo.source === 'json' && (
                  <button
                    onClick={locateError}
                    className="flex items-center gap-1 bg-red-800 hover:bg-red-700 px-2 py-1 rounded border border-red-600 transition"
                  >
                    <LocateFixed size={12} /> 定位 (Line {errorInfo.line})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Visualizer */}
        <div className={`flex-1 flex flex-col min-w-0 ${showHistory && window.innerWidth < 1024 ? 'hidden' : ''}`}>
          <div className={`h-9 flex items-center justify-between px-4 text-xs font-mono border-b ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <span className="opacity-60 font-bold">VISUALIZER</span>
            <div className="opacity-50 flex items-center gap-1">
              <FileJson size={12} />
              {parsedData ? (Array.isArray(parsedData) ? `Array[${(parsedData as JSONArray).length}]` : `Object{${Object.keys(parsedData as JSONObject).length}}`) : 'Waiting'}
            </div>
          </div>
          <div
            ref={visualizerRef}
            onScroll={() => handleScroll('visualizer')}
            className={`flex-1 overflow-auto p-4 custom-scrollbar ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}
          >
            {parsedData ? (
              <div className="pb-20">
                {['object', 'array'].includes(getType(parsedData)) ? (
                  Object.entries(parsedData as JSONObject | JSONArray).map(([k, v]) => (
                    <JsonNode
                      key={k}
                      keyName={Array.isArray(parsedData) ? undefined : k}
                      value={v}
                      path={[k]}
                      onDelete={(p) => updateDataAtPath(p, 'delete', null, '删除节点')}
                      onUpdate={(p, val, name) => updateDataAtPath(p, 'update', val, name)}
                    />
                  ))
                ) : (
                  <div className="text-gray-500 italic p-4 border border-dashed border-gray-600 rounded">
                    Primitive Value: <span className="text-green-400">{String(parsedData)}</span>
                  </div>
                )}
                {Array.isArray(parsedData) && <div className="ml-5 text-gray-500">]</div>}
                {!Array.isArray(parsedData) && parsedData && getType(parsedData) === 'object' && <div className="ml-5 text-gray-500">{'}'}</div>}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                <PackageOpen size={48} className="opacity-20" />
                <p>等待有效输入...</p>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className={`w-64 border-l flex flex-col shrink-0 transition-all ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-3 font-bold text-sm border-b border-gray-700 flex justify-between items-center bg-opacity-50">
              <span className="flex items-center gap-2"><Activity size={14} className="text-blue-500" /> 本地操作历史</span>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white"><Minimize2 size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-2 custom-scrollbar">
              {historyList.length === 0 && (
                <div className="text-center text-xs text-gray-500 mt-10 p-4 border border-dashed border-gray-700 rounded mx-2">
                  暂无操作记录<br />
                  <span className="opacity-50 mt-1 block transform scale-90">修改、删除或格式化操作将自动记录于此</span>
                </div>
              )}
              {historyList.map((item) => (
                <div key={item.id}
                  onClick={() => restoreHistory(item)}
                  className={`p-2 rounded cursor-pointer group text-xs border relative overflow-hidden transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-600' : 'bg-gray-100 border-gray-200 hover:border-blue-500'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 font-bold font-mono">
                      {item.action}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="opacity-60 truncate font-mono text-[10px] bg-black/20 p-1 rounded">
                    {item.preview}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-700 text-[10px] text-center opacity-40">
              仅记录本次会话操作
            </div>
          </div>
        )}

      </div>

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-bounce z-50">
          {notification}
        </div>
      )}
    </div>
  );
}
