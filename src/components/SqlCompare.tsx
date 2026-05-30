import { useState, useRef, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { format } from 'sql-formatter';
import { 
  Database,
  Trash2, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  Sparkles,
  EyeOff,
  Sliders
} from 'lucide-react';

const SQL_DIALECTS = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'plsql', label: 'Oracle PL/SQL' },
  { value: 'tsql', label: 'Transact-SQL (T-SQL)' }
];

export default function SqlCompare() {
  const [dialect, setDialect] = useState<'sql' | 'mysql' | 'postgresql' | 'plsql' | 'tsql'>('sql');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [stripComments, setStripComments] = useState(false);
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [dataTypeCase, setDataTypeCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [functionCase, setFunctionCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [logicalOperatorNewline, setLogicalOperatorNewline] = useState<'before' | 'after'>('before');
  const [expressionWidth, setExpressionWidth] = useState<number>(50);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [originalSql, setOriginalSql] = useState(
    `-- Original SQL\nSELECT user_id, user_name, email_address\nFROM users u\nJOIN orders o ON u.user_id = o.customer_id\nWHERE o.order_date > '2023-01-01' -- filter by date\nAND o.status = 'completed';`
  );
  
  const [modifiedSql, setModifiedSql] = useState(
    `/* Modified SQL - optimized query */\nselect u.user_id, u.user_name, u.email_address\nfrom users u\ninner join orders o on u.user_id=o.customer_id\nwhere o.order_date > '2023-01-01'\n  and o.status = 'completed'\norder by o.order_date desc;`
  );

  const [displayOriginal, setDisplayOriginal] = useState(originalSql);
  const [displayModified, setDisplayModified] = useState(modifiedSql);

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModified, setCopiedModified] = useState(false);

  const diffEditorRef = useRef<any>(null);

  // Strip comments regex utility
  const removeComments = (sql: string) => {
    // Strip block comments /* ... */
    let result = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    // Strip line comments -- ...
    result = result.replace(/--.*$/gm, '');
    // Remove empty lines created by removing comments
    return result.split('\n').filter(line => line.trim() !== '').join('\n');
  };

  // Process SQL based on rules
  const processSql = (sql: string, applyFormatting: boolean) => {
    let processed = sql;
    
    if (stripComments) {
      processed = removeComments(processed);
    }
    
    if (applyFormatting) {
      try {
        processed = format(processed, {
          language: dialect === 'tsql' ? 'sql' : dialect, // sql-formatter supports postgresql, mysql, plsql, sql
          keywordCase,
          dataTypeCase,
          functionCase,
          logicalOperatorNewline,
          expressionWidth,
          indentStyle: 'standard',
          tabWidth: 2
        });
      } catch (err) {
        console.warn('SQL format failed, showing raw SQL:', err);
      }
    }
    
    return processed;
  };

  // Re-run processing whenever settings or raw inputs change
  useEffect(() => {
    setDisplayOriginal(processSql(originalSql, true));
    setDisplayModified(processSql(modifiedSql, true));
  }, [
    originalSql, 
    modifiedSql, 
    dialect, 
    stripComments, 
    keywordCase, 
    dataTypeCase, 
    functionCase, 
    logicalOperatorNewline, 
    expressionWidth
  ]);

  const handleEditorMount = (editor: any) => {
    diffEditorRef.current = editor;

    // Sync edited values back to raw state
    editor.getOriginalEditor().onDidChangeModelContent(() => {
      const val = editor.getOriginalEditor().getValue();
      setOriginalSql(val);
    });

    editor.getModifiedEditor().onDidChangeModelContent(() => {
      const val = editor.getModifiedEditor().getValue();
      setModifiedSql(val);
    });
  };

  const handleSwap = () => {
    const temp = originalSql;
    setOriginalSql(modifiedSql);
    setModifiedSql(temp);
  };

  const handleClear = () => {
    setOriginalSql('');
    setModifiedSql('');
  };

  const formatInputsInPlace = () => {
    const formattedOrig = processSql(originalSql, true);
    const formattedMod = processSql(modifiedSql, true);
    setOriginalSql(formattedOrig);
    setModifiedSql(formattedMod);
    
    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue(formattedOrig);
      diffEditorRef.current.getModifiedEditor().setValue(formattedMod);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-5 h-full">
      {/* SQL Compare Settings Toolbar */}
      <div className="card bg-white flex flex-col overflow-hidden border border-zinc-200">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SQL Dialect</span>
              <select 
                value={dialect} 
                onChange={(e) => setDialect(e.target.value as any)}
                className="btn-secondary py-1.5 px-3 pr-8"
                style={{ appearance: 'auto' }}
              >
                {SQL_DIALECTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Core Rules Checkboxes */}
            <div className="flex items-center gap-4 pt-2 md:pt-0">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={stripComments}
                  onChange={(e) => setStripComments(e.target.checked)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-4 w-4"
                />
                <span className="flex items-center gap-1">
                  <EyeOff size={14} className="text-zinc-400" />
                  Strip Comments
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="rounded border-zinc-300 text-black focus:ring-black h-4 w-4"
                />
                <span>Ignore Whitespace</span>
              </label>
            </div>

            {/* Advanced Toggle */}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`btn-secondary py-1.5 px-3 flex items-center gap-2 ${showAdvanced ? 'bg-zinc-100 border-zinc-400 text-black' : ''}`}
            >
              <Sliders size={14} />
              <span>Advanced Styling {showAdvanced ? '▲' : '▼'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={formatInputsInPlace} 
              className="btn-primary py-1.5"
              title="Auto-format and clean original inputs"
            >
              <Sparkles size={14} />
              <span>Format & Align</span>
            </button>
            
            <button onClick={handleSwap} className="btn-secondary py-1.5" title="Swap Panels">
              <ArrowLeftRight size={14} />
              <span>Swap</span>
            </button>
            
            <button onClick={handleClear} className="btn-secondary py-1.5 text-red-600 hover:text-red-700" title="Clear All">
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Redgate-style Settings Panel */}
        {showAdvanced && (
          <div className="p-5 bg-zinc-50 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in text-sm">
            {/* Casing Rules */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">Casing Rules</span>
              
              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs">Keywords:</label>
                <select 
                  value={keywordCase} 
                  onChange={(e) => setKeywordCase(e.target.value as any)}
                  className="btn-secondary py-1 px-2 text-xs bg-white"
                  style={{ appearance: 'auto' }}
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs">Functions:</label>
                <select 
                  value={functionCase} 
                  onChange={(e) => setFunctionCase(e.target.value as any)}
                  className="btn-secondary py-1 px-2 text-xs bg-white"
                  style={{ appearance: 'auto' }}
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs">Data Types:</label>
                <select 
                  value={dataTypeCase} 
                  onChange={(e) => setDataTypeCase(e.target.value as any)}
                  className="btn-secondary py-1 px-2 text-xs bg-white"
                  style={{ appearance: 'auto' }}
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>
            </div>

            {/* Layout Rules */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">Logical Operators</span>
              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs">Line Break:</label>
                <select 
                  value={logicalOperatorNewline} 
                  onChange={(e) => setLogicalOperatorNewline(e.target.value as any)}
                  className="btn-secondary py-1 px-2 text-xs bg-white"
                  style={{ appearance: 'auto' }}
                >
                  <option value="before">Before Operator (AND/OR at start)</option>
                  <option value="after">After Operator (AND/OR at end)</option>
                </select>
              </div>
            </div>

            {/* List Formatting */}
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-xs text-zinc-500 uppercase tracking-wider">Expression Spacing</span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-zinc-600 text-xs">Wrap Threshold:</label>
                  <span className="text-xs font-semibold text-zinc-800">{expressionWidth} chars</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={expressionWidth} 
                  onChange={(e) => setExpressionWidth(parseInt(e.target.value))}
                  className="w-full accent-black h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400">Controls line wrapping within parenthesis lists.</span>
              </div>
            </div>

            {/* Redgate Presets Info */}
            <div className="flex flex-col gap-1.5 bg-zinc-100/80 p-3 rounded-md border border-zinc-200">
              <span className="font-bold text-xs text-zinc-700 flex items-center gap-1">
                <Sparkles size={12} className="text-zinc-500" />
                Redgate Prompt Style
              </span>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Aligns column definitions, normalizes operators, and implements case capitalization parameters across SQL dialects automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SQL Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original SQL Card */}
        <div className="card p-3 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <Database size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm">Original SQL Query</span>
          </div>
          <button 
            onClick={() => copyToClipboard(displayOriginal, setCopiedOriginal)} 
            className="btn-secondary py-1 px-2.5 text-xs"
          >
            {copiedOriginal ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            <span className="ml-1">{copiedOriginal ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Modified SQL Card */}
        <div className="card p-3 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <Database size={16} className="text-zinc-500" />
            <span className="font-semibold text-sm">Modified SQL Query</span>
          </div>
          <button 
            onClick={() => copyToClipboard(displayModified, setCopiedModified)} 
            className="btn-secondary py-1 px-2.5 text-xs"
          >
            {copiedModified ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            <span className="ml-1">{copiedModified ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="card overflow-hidden flex-1 border border-zinc-200 min-h-[450px]">
        <DiffEditor
          height="100%"
          language="sql"
          original={displayOriginal}
          modified={displayModified}
          onMount={handleEditorMount}
          theme="vs"
          options={{
            renderSideBySide: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            automaticLayout: true,
            ignoreTrimWhitespace: ignoreWhitespace,
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10
            },
            diffWordWrap: 'on',
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  );
}
