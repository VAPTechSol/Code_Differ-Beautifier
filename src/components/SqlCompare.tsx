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

  const isIdentical = displayOriginal.trim() === displayModified.trim();

  return (
    <div className="animate-fade-in flex flex-col gap-4 flex-1 min-h-0">
      {/* SQL Compare Settings Toolbar */}
      <div className="card bg-white flex flex-col overflow-hidden border-2 border-zinc-200 shrink-0">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">SQL Dialect</span>
              <select 
                value={dialect} 
                onChange={(e) => setDialect(e.target.value as any)}
                className="py-1 px-3 pr-8"
              >
                {SQL_DIALECTS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Core Rules Checkboxes */}
            <div className="flex items-center gap-5 pt-2 md:pt-0">
              <label className="flex items-center gap-2.5 text-xs font-mono font-bold text-zinc-700 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={stripComments}
                  onChange={(e) => setStripComments(e.target.checked)}
                  className="rounded-md border-2 border-zinc-300 text-[#ff6b00] focus:ring-[#ff6b00] h-4.5 w-4.5 accent-[#ff6b00] cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <EyeOff size={13} className="text-zinc-400" />
                  Strip Comments
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-mono font-bold text-zinc-700 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="rounded-md border-2 border-zinc-300 text-[#ff6b00] focus:ring-[#ff6b00] h-4.5 w-4.5 accent-[#ff6b00] cursor-pointer"
                />
                <span>Ignore Whitespace</span>
              </label>
            </div>

            {/* Advanced Toggle */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Preferences</span>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`btn-secondary py-1.5 px-3 flex items-center gap-2 btn-spring ${showAdvanced ? 'border-zinc-950 bg-zinc-950 text-white font-bold shadow-[2px_2px_0px_0px_#000000] hover:text-white' : ''}`}
              >
                <Sliders size={13} />
                <span>Formatter Settings {showAdvanced ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* Match Status Badge */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Match Status</span>
              <div className="flex items-center min-h-[30px]">
                {isIdentical ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[11px] font-bold border-2 border-green-300 rounded-lg animate-success-pop font-mono">
                    <span>Perfect Match! No drama here. 🤝</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#ff6b00] text-[11px] font-bold border-2 border-[#ff6b00]/30 rounded-lg font-mono">
                    <span>Divergence detected! Code has drifted. 🚨</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={formatInputsInPlace} 
              className="btn-primary py-1.5 px-4 btn-spring text-xs"
              title="Auto-format and clean original inputs"
            >
              <Sparkles size={13} />
              <span>Format & Align</span>
            </button>
            
            <button onClick={handleSwap} className="btn-secondary py-1.5 px-3 btn-spring" title="Swap Panels">
              <ArrowLeftRight size={13} />
              <span>Swap</span>
            </button>
            
            <button onClick={handleClear} className="btn-secondary py-1.5 px-3 btn-spring text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50/20" title="Clear All">
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Settings Panel */}
        {showAdvanced && (
          <div className="p-5 bg-zinc-50 border-t-2 border-zinc-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in text-sm dot-pattern">
            {/* Casing Rules */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">Casing Rules</span>
              
              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Keywords:</label>
                <select 
                  value={keywordCase} 
                  onChange={(e) => setKeywordCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Functions:</label>
                <select 
                  value={functionCase} 
                  onChange={(e) => setFunctionCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Data Types:</label>
                <select 
                  value={dataTypeCase} 
                  onChange={(e) => setDataTypeCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>
            </div>

            {/* Layout Rules */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">Logical Operators</span>
              <div className="flex flex-col gap-2">
                <label className="text-zinc-600 text-xs font-mono font-bold">Line Break Position:</label>
                <select 
                  value={logicalOperatorNewline} 
                  onChange={(e) => setLogicalOperatorNewline(e.target.value as any)}
                  className="py-1 px-2 text-xs w-full"
                >
                  <option value="before">Before Operator (AND/OR start)</option>
                  <option value="after">After Operator (AND/OR end)</option>
                </select>
              </div>
            </div>

            {/* List Formatting */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">Expression Spacing</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-zinc-600 text-xs font-mono font-bold">Wrap Threshold:</label>
                  <span className="text-xs font-mono font-extrabold text-[#ff6b00]">{expressionWidth} chars</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={expressionWidth} 
                  onChange={(e) => setExpressionWidth(parseInt(e.target.value))}
                  className="w-full accent-[#ff6b00] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer border border-zinc-300"
                />
                <span className="text-[10px] text-zinc-400 font-mono">Controls parentheses list breaking.</span>
              </div>
            </div>

            {/* Redgate Presets Info */}
            <div className="card p-4 bg-zinc-50 flex flex-col gap-2 border-dashed">
              <span className="font-extrabold text-[10px] text-zinc-700 font-mono uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} className="text-[#ff6b00]" />
                Redgate Prompt Style
              </span>
              <p className="text-[11px] text-zinc-500 leading-normal font-mono">
                Aligns columns, normalizes JOIN conditions, and applies case regulations to standard dialect systems.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SQL Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        {/* Original SQL Card */}
        <div className="card p-2 px-4 flex items-center justify-between dark-terminal-header border-b-0 rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <Database size={15} className="text-[#ff6b00]" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">Original SQL Query</span>
          </div>
          <button 
            onClick={() => copyToClipboard(displayOriginal, setCopiedOriginal)} 
            className="btn-terminal btn-spring"
          >
            {copiedOriginal ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            <span className="ml-1">{copiedOriginal ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Modified SQL Card */}
        <div className="card p-2 px-4 flex items-center justify-between dark-terminal-header border-b-0 rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <Database size={15} className="text-[#ff6b00]" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">Modified SQL Query</span>
          </div>
          <button 
            onClick={() => copyToClipboard(displayModified, setCopiedModified)} 
            className="btn-terminal btn-spring"
          >
            {copiedModified ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
            <span className="ml-1">{copiedModified ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="card dark-editor-card overflow-hidden flex-1 min-h-0 border-t-0 rounded-t-none">
        <DiffEditor
          height="100%"
          language="sql"
          original={displayOriginal}
          modified={displayModified}
          onMount={handleEditorMount}
          theme="vs"
          options={{
            originalEditable: true,
            readOnly: false,
            renderSideBySide: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 18,
            fontFamily: "'JetBrains Mono', monospace",
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
