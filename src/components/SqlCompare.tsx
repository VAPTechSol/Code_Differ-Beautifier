import { useState, useRef, useEffect, useMemo } from 'react';
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
  Sliders,
  Share2,
  Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { 
  computeDiffStats, 
  generateMarkdownDiff, 
  downloadPatchFile, 
  encodeDiffShare 
} from '../utils/diffUtils';

const SQL_DIALECTS = [
  { value: 'sql', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'plsql', label: 'Oracle PL/SQL' },
  { value: 'tsql', label: 'Transact-SQL (T-SQL)' }
];

export default function SqlCompare() {
  const { theme } = useTheme();
  const [dialect, setDialect] = useState<'sql' | 'mysql' | 'postgresql' | 'plsql' | 'tsql'>(() => {
    return (localStorage.getItem('kollidr-sql-dialect') as any) || 'sql';
  });
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(() => {
    return localStorage.getItem('kollidr-sql-ignore-ws') !== 'false';
  });
  const [stripComments, setStripComments] = useState(() => {
    return localStorage.getItem('kollidr-sql-strip-comments') === 'true';
  });
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>(() => {
    return (localStorage.getItem('kollidr-sql-keyword-case') as any) || 'upper';
  });
  const [dataTypeCase, setDataTypeCase] = useState<'upper' | 'lower' | 'preserve'>(() => {
    return (localStorage.getItem('kollidr-sql-datatype-case') as any) || 'upper';
  });
  const [functionCase, setFunctionCase] = useState<'upper' | 'lower' | 'preserve'>(() => {
    return (localStorage.getItem('kollidr-sql-function-case') as any) || 'upper';
  });
  const [logicalOperatorNewline, setLogicalOperatorNewline] = useState<'before' | 'after'>(() => {
    return (localStorage.getItem('kollidr-sql-logical-nl') as any) || 'before';
  });
  const [expressionWidth, setExpressionWidth] = useState<number>(() => {
    const val = localStorage.getItem('kollidr-sql-expr-width');
    return val ? parseInt(val) : 50;
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync settings back to localStorage
  useEffect(() => {
    localStorage.setItem('kollidr-sql-dialect', dialect);
    localStorage.setItem('kollidr-sql-ignore-ws', String(ignoreWhitespace));
    localStorage.setItem('kollidr-sql-strip-comments', String(stripComments));
    localStorage.setItem('kollidr-sql-keyword-case', keywordCase);
    localStorage.setItem('kollidr-sql-datatype-case', dataTypeCase);
    localStorage.setItem('kollidr-sql-function-case', functionCase);
    localStorage.setItem('kollidr-sql-logical-nl', logicalOperatorNewline);
    localStorage.setItem('kollidr-sql-expr-width', String(expressionWidth));
  }, [
    dialect,
    ignoreWhitespace,
    stripComments,
    keywordCase,
    dataTypeCase,
    functionCase,
    logicalOperatorNewline,
    expressionWidth
  ]);
  
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

  // Re-run processing only when format settings change (not on raw edits to prevent cursor reset)
  useEffect(() => {
    const formattedOrig = processSql(originalSql, true);
    const formattedMod = processSql(modifiedSql, true);
    setDisplayOriginal(formattedOrig);
    setDisplayModified(formattedMod);
    
    // Pushing value to Monaco editor instances if mounted and value changed
    if (diffEditorRef.current) {
      const origEditor = diffEditorRef.current.getOriginalEditor();
      const modEditor = diffEditorRef.current.getModifiedEditor();
      if (origEditor && origEditor.getValue() !== formattedOrig) {
        origEditor.setValue(formattedOrig);
      }
      if (modEditor && modEditor.getValue() !== formattedMod) {
        modEditor.setValue(formattedMod);
      }
    }
  }, [
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

    // Sync edited values back to raw state and display state
    editor.getOriginalEditor().onDidChangeModelContent(() => {
      const val = editor.getOriginalEditor().getValue();
      setOriginalSql(val);
      setDisplayOriginal(val); // Keeps display state in sync, preventing Monaco from resetting cursor
    });

    editor.getModifiedEditor().onDidChangeModelContent(() => {
      const val = editor.getModifiedEditor().getValue();
      setModifiedSql(val);
      setDisplayModified(val); // Keeps display state in sync, preventing Monaco from resetting cursor
    });
  };

  const handleSwap = () => {
    const tempOrig = originalSql;
    const tempMod = modifiedSql;
    
    setOriginalSql(tempMod);
    setModifiedSql(tempOrig);
    setDisplayOriginal(tempMod);
    setDisplayModified(tempOrig);
    
    if (diffEditorRef.current) {
      const origEditor = diffEditorRef.current.getOriginalEditor();
      const modEditor = diffEditorRef.current.getModifiedEditor();
      if (origEditor) origEditor.setValue(tempMod);
      if (modEditor) modEditor.setValue(tempOrig);
    }
  };

  const handleClear = () => {
    setOriginalSql('');
    setModifiedSql('');
    setDisplayOriginal('');
    setDisplayModified('');
    if (diffEditorRef.current) {
      const origEditor = diffEditorRef.current.getOriginalEditor();
      const modEditor = diffEditorRef.current.getModifiedEditor();
      if (origEditor) origEditor.setValue('');
      if (modEditor) modEditor.setValue('');
    }
  };

  const formatInputsInPlace = () => {
    const formattedOrig = processSql(originalSql, true);
    const formattedMod = processSql(modifiedSql, true);
    setOriginalSql(formattedOrig);
    setModifiedSql(formattedMod);
    setDisplayOriginal(formattedOrig);
    setDisplayModified(formattedMod);
    
    if (diffEditorRef.current) {
      const origEditor = diffEditorRef.current.getOriginalEditor();
      const modEditor = diffEditorRef.current.getModifiedEditor();
      if (origEditor) origEditor.setValue(formattedOrig);
      if (modEditor) modEditor.setValue(formattedMod);
    }
  };

  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const diffStats = useMemo(() => {
    return computeDiffStats(displayOriginal, displayModified);
  }, [displayOriginal, displayModified]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const encoded = encodeDiffShare(displayOriginal, displayModified, 'sql');
    const url = `${window.location.origin}${window.location.pathname}#diff=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownDiff(displayOriginal, displayModified, 'queries.sql');
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2200);
  };

  const handleDownloadPatch = () => {
    downloadPatchFile(displayOriginal, displayModified, `align_sql_${Date.now()}.patch`);
  };

  const isIdentical = displayOriginal.trim() === displayModified.trim();

  return (
    <div className="animate-fade-in flex flex-col gap-3.5 flex-1 min-h-0">
      {/* SQL Compare Settings Toolbar */}
      <div className="card flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200 dark:border-zinc-800">
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
              <label className="flex items-center gap-2.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
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

              <label className="flex items-center gap-2.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
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
                className={`btn-secondary py-1.5 px-3 flex items-center gap-2 btn-spring ${showAdvanced ? 'border-zinc-950 dark:border-zinc-600 bg-zinc-950 dark:bg-zinc-800 text-white font-bold shadow-sm' : ''}`}
              >
                <Sliders size={13} />
                <span>Formatter Settings {showAdvanced ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button 
              onClick={formatInputsInPlace} 
              className="btn-primary py-1.5 px-3.5 btn-spring text-xs"
              title="Auto-format and clean original inputs"
            >
              <Sparkles size={13} />
              <span>Format & Align</span>
            </button>

            <button 
              onClick={handleShareLink} 
              className="btn-secondary py-1.5 px-3 btn-spring flex items-center gap-1.5"
              title="Create shareable compressed URL link"
            >
              {copiedShare ? <Check size={13} className="text-green-600" /> : <Share2 size={13} className="text-[#ff6b00]" />}
              <span className="text-xs">{copiedShare ? 'Link Copied!' : 'Share Diff'}</span>
            </button>

            <button 
              onClick={handleCopyMarkdown} 
              className="btn-secondary py-1.5 px-3 btn-spring flex items-center gap-1.5"
              title="Copy GitHub Markdown diff for PRs"
            >
              {copiedMarkdown ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span className="text-xs">{copiedMarkdown ? 'Copied MD!' : 'Copy for PR'}</span>
            </button>

            <button 
              onClick={handleDownloadPatch} 
              className="btn-secondary py-1.5 px-2.5 btn-spring"
              title="Download unified .patch file"
            >
              <Download size={13} />
            </button>
            
            <button onClick={handleSwap} className="btn-secondary py-1.5 px-3 btn-spring" title="Swap Panels">
              <ArrowLeftRight size={13} />
              <span className="text-xs">Swap</span>
            </button>
            
            <button onClick={handleClear} className="btn-secondary py-1.5 px-2.5 btn-spring text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50/20" title="Clear All">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Diff Metrics HUD (Heads-Up Display) */}
        <div className="p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Similarity & Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Query Similarity:</span>
              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                <span className="font-extrabold text-[#ff6b00]">{diffStats.similarity}%</span>
                <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${diffStats.similarity === 100 ? 'bg-green-500' : 'bg-[#ff6b00]'}`}
                    style={{ width: `${diffStats.similarity}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

            {/* Additions & Deletions Counter */}
            <div className="flex items-center gap-3 font-bold">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                +{diffStats.additions} lines
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                -{diffStats.deletions} lines
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-normal hidden md:inline">
                ({diffStats.originalLines} orig / {diffStats.modifiedLines} mod)
              </span>
            </div>
          </div>

          {/* Match status indicator */}
          <div className="flex items-center gap-1.5">
            {isIdentical ? (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-[11px]">
                <Sparkles size={12} />
                Queries Identical
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#ff6b00] font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
                Query Differences Detected
              </span>
            )}
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
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
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
