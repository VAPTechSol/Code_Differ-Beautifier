import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { 
  Columns, 
  Rows, 
  Upload, 
  Trash2, 
  ArrowLeftRight, 
  Copy, 
  Check, 
  FileText,
  Share2,
  Download,
  EyeOff,
  WrapText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Type,
  FileCode2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import EditorSkeleton from './EditorSkeleton';
import ChangeInspector from './ChangeInspector';
import ToastContainer, { type ToastMessage } from './Toast';
import { 
  computeDetailedDiff, 
  downloadPatchFile, 
  downloadHtmlReport,
  encodeDiffShare, 
  decodeDiffShare,
  type DiffHunk
} from '../utils/diffUtils';

const LANGUAGES = [
  // Popular first
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  
  // Others
  { value: 'ada', label: 'Ada' },
  { value: 'apex', label: 'Apex' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'coffeescript', label: 'CoffeeScript' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lua', label: 'Lua' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'scala', label: 'Scala' },
  { value: 'shell', label: 'Shell / Bash' },
  { value: 'swift', label: 'Swift' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' }
];

const DIFF_PRESETS = [
  {
    id: 'js-es6',
    title: 'JavaScript: ES5 to Modern ES6+',
    lang: 'javascript',
    original: `// Legacy User Management Module
function processUser(user, options) {
  var discount = 0;
  if (options && options.isVip) {
    discount = 0.2;
  }
  var finalPrice = user.price - (user.price * discount);
  return {
    id: user.id,
    name: user.firstName + ' ' + user.lastName,
    total: finalPrice
  };
}`,
    modified: `// Modern User Management Module
export const processUser = (user, options = {}) => {
  const discount = options.isVip ? 0.2 : 0;
  const finalPrice = user.price * (1 - discount);
  
  return {
    id: user.id,
    fullName: \`\${user.firstName} \${user.lastName}\`.trim(),
    total: Number(finalPrice.toFixed(2)),
    processedAt: new Date().toISOString()
  };
};`
  },
  {
    id: 'ts-safe',
    title: 'TypeScript: Interface & Safety',
    lang: 'typescript',
    original: `function fetchConfig(env: string) {
  let endpoint = "http://localhost:3000";
  if (env === "prod") {
    endpoint = "https://api.myapp.com";
  }
  return { endpoint, timeout: 5000 };
}`,
    modified: `interface AppConfig {
  endpoint: string;
  timeout: number;
  retries?: number;
  debug: boolean;
}

export function fetchConfig(env: 'dev' | 'staging' | 'prod'): AppConfig {
  const endpoints: Record<string, string> = {
    dev: "http://localhost:3000",
    staging: "https://staging-api.myapp.com",
    prod: "https://api.myapp.com"
  };

  return {
    endpoint: endpoints[env] ?? endpoints.dev,
    timeout: env === 'prod' ? 10000 : 5000,
    retries: env === 'prod' ? 3 : 1,
    debug: env !== 'prod'
  };
}`
  },
  {
    id: 'json-config',
    title: 'JSON: App Config & Feature Flags',
    lang: 'json',
    original: `{
  "app": "CodeBeautifier",
  "version": "1.0.0",
  "features": {
    "darkMode": true,
    "experimentalDiff": false
  },
  "maxFileSizeMB": 5
}`,
    modified: `{
  "app": "AlignStudio",
  "version": "1.2.0",
  "features": {
    "darkMode": true,
    "experimentalDiff": true,
    "changeInspector": true,
    "smoothAnimations": true
  },
  "maxFileSizeMB": 25,
  "telemetry": false
}`
  },
  {
    id: 'sql-query',
    title: 'SQL: Query Optimization & Aggregations',
    lang: 'sql',
    original: `SELECT users.id, users.name, orders.amount
FROM users, orders
WHERE users.id = orders.user_id
AND orders.status = 'completed';`,
    modified: `SELECT 
  u.id AS user_id, 
  u.name, 
  COUNT(o.id) AS total_orders,
  SUM(o.amount) AS total_revenue
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
  AND o.created_at >= '2026-01-01'
GROUP BY u.id, u.name
ORDER BY total_revenue DESC;`
  }
];

export default function CodeDiff() {
  const { theme } = useTheme();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('align-diff-language') || 'javascript';
  });
  const [splitView, setSplitView] = useState(() => {
    return localStorage.getItem('align-diff-split') !== 'false';
  });
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const [originalCode, setOriginalCode] = useState('// Paste original code here\nfunction calculateTotal(price, tax) {\n  var result = price + tax;\n  return result;\n}');
  const [modifiedCode, setModifiedCode] = useState('// Paste modified code here\nconst calculateTotal = (price, tax) => {\n  if (!price) return 0;\n  return price + tax;\n};');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModified, setCopiedModified] = useState(false);

  // Inspector & Navigation state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [activeHunkIndex, setActiveHunkIndex] = useState(0);
  const [activeHunkId, setActiveHunkId] = useState<string | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync settings back to localStorage
  useEffect(() => {
    localStorage.setItem('align-diff-language', language);
    localStorage.setItem('align-diff-split', String(splitView));
  }, [language, splitView]);

  // Decode shared link from URL hash on mount
  useEffect(() => {
    const shared = decodeDiffShare(window.location.hash);
    if (shared) {
      if (shared.original) setOriginalCode(shared.original);
      if (shared.modified) setModifiedCode(shared.modified);
      if (shared.lang) setLanguage(shared.lang);
      if (diffEditorRef.current) {
        diffEditorRef.current.getOriginalEditor().setValue(shared.original);
        diffEditorRef.current.getModifiedEditor().setValue(shared.modified);
      }
      addToast('Shared Diff Loaded', 'Populated code from URL hash link', 'info');
    }
  }, [addToast]);

  const diffEditorRef = useRef<any>(null);

  // Compute detailed diff with hunk analysis and token-level diffs
  const detailedDiff = useMemo(() => {
    return computeDetailedDiff(originalCode, modifiedCode, {
      ignoreWhitespace,
      ignoreCase,
      language
    });
  }, [originalCode, modifiedCode, ignoreWhitespace, ignoreCase, language]);

  const handleEditorMount = (editor: any) => {
    diffEditorRef.current = editor;

    // Listen to changes in original editor
    editor.getOriginalEditor().onDidChangeModelContent(() => {
      setOriginalCode(editor.getOriginalEditor().getValue());
    });

    // Listen to changes in modified editor
    editor.getModifiedEditor().onDidChangeModelContent(() => {
      setModifiedCode(editor.getModifiedEditor().getValue());
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'original' | 'modified') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (target === 'original') {
        setOriginalCode(text);
        if (diffEditorRef.current) {
          diffEditorRef.current.getOriginalEditor().setValue(text);
        }
      } else {
        setModifiedCode(text);
        if (diffEditorRef.current) {
          diffEditorRef.current.getModifiedEditor().setValue(text);
        }
      }

      addToast(`Uploaded ${file.name}`, `Loaded into ${target} editor`, 'success');

      // Auto-detect language extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext) {
        const langMap: Record<string, string> = {
          js: 'javascript',
          jsx: 'javascript',
          ts: 'typescript',
          tsx: 'typescript',
          html: 'html',
          htm: 'html',
          css: 'css',
          json: 'json',
          sql: 'sql',
          py: 'python',
          java: 'java',
          cpp: 'cpp',
          cc: 'cpp',
          h: 'cpp',
          cs: 'csharp',
          php: 'php',
          go: 'go',
          rs: 'rust',
          rb: 'ruby',
          swift: 'swift',
          kt: 'kotlin',
          dart: 'dart',
          r: 'r',
          pl: 'perl',
          scala: 'scala',
          lua: 'lua',
          md: 'markdown',
          sh: 'shell',
          bash: 'shell',
          xml: 'xml',
          yaml: 'yaml',
          yml: 'yaml',
          txt: 'plaintext'
        };
        if (langMap[ext]) {
          setLanguage(langMap[ext]);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSwap = () => {
    const temp = originalCode;
    setOriginalCode(modifiedCode);
    setModifiedCode(temp);
    
    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue(modifiedCode);
      diffEditorRef.current.getModifiedEditor().setValue(temp);
    }
    addToast('Panels Swapped', 'Original and Modified panels interchanged', 'info');
  };

  const handleClear = () => {
    setOriginalCode('');
    setModifiedCode('');
    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue('');
      diffEditorRef.current.getModifiedEditor().setValue('');
    }
    addToast('Cleared Editors', 'Both panels have been emptied', 'info');
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Copied to Clipboard', label, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(detailedDiff.markdownChangelog);
    addToast('PR Changelog Copied!', 'Markdown formatted diff ready for GitHub/GitLab PRs', 'success');
  };

  const handleShareLink = () => {
    const encoded = encodeDiffShare(originalCode, modifiedCode, language);
    const url = `${window.location.origin}${window.location.pathname}#diff=${encoded}`;
    navigator.clipboard.writeText(url);
    addToast('Diff Link Copied!', 'Shareable URL with embedded code is in your clipboard', 'success');
  };

  const handleDownloadPatch = () => {
    downloadPatchFile(originalCode, modifiedCode, `align_diff_${Date.now()}.patch`);
    addToast('Downloaded .patch', 'Standard unified patch file saved', 'success');
  };

  const handleExportHtml = () => {
    downloadHtmlReport(originalCode, modifiedCode, `diff_${language}_report.html`, language);
    addToast('Exported HTML Report', 'Self-contained interactive HTML file downloaded', 'success');
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = DIFF_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setOriginalCode(preset.original);
    setModifiedCode(preset.modified);
    setLanguage(preset.lang);

    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue(preset.original);
      diffEditorRef.current.getModifiedEditor().setValue(preset.modified);
    }
    addToast(`Loaded ${preset.title}`, `Set language to ${preset.lang}`, 'info');
  };

  // Jump to specific hunk in Monaco editor
  const handleJumpToHunk = useCallback((hunk: DiffHunk) => {
    if (!diffEditorRef.current) return;
    const originalEditor = diffEditorRef.current.getOriginalEditor();
    const modifiedEditor = diffEditorRef.current.getModifiedEditor();

    if (hunk.origStartLine > 0 && originalEditor) {
      originalEditor.revealLineInCenter(hunk.origStartLine);
      originalEditor.setPosition({ lineNumber: hunk.origStartLine, column: 1 });
    }
    if (hunk.modStartLine > 0 && modifiedEditor) {
      modifiedEditor.revealLineInCenter(hunk.modStartLine);
      modifiedEditor.setPosition({ lineNumber: hunk.modStartLine, column: 1 });
    }
    setActiveHunkId(hunk.id);
  }, []);

  // Jump to Next / Prev Difference
  const handleNextDiff = useCallback(() => {
    if (detailedDiff.hunks.length === 0) return;
    const nextIdx = (activeHunkIndex + 1) % detailedDiff.hunks.length;
    setActiveHunkIndex(nextIdx);
    handleJumpToHunk(detailedDiff.hunks[nextIdx]);
  }, [activeHunkIndex, detailedDiff.hunks, handleJumpToHunk]);

  const handlePrevDiff = useCallback(() => {
    if (detailedDiff.hunks.length === 0) return;
    const prevIdx = (activeHunkIndex - 1 + detailedDiff.hunks.length) % detailedDiff.hunks.length;
    setActiveHunkIndex(prevIdx);
    handleJumpToHunk(detailedDiff.hunks[prevIdx]);
  }, [activeHunkIndex, detailedDiff.hunks, handleJumpToHunk]);

  // Keyboard shortcut listener for F7 / Shift+F7 to navigate differences
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F7') {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrevDiff();
        } else {
          handleNextDiff();
        }
      }
      if (e.key === 'Escape' && isInspectorOpen) {
        setIsInspectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextDiff, handlePrevDiff, isInspectorOpen]);

  const isIdentical = originalCode.trim() === modifiedCode.trim();
  const { stats, hunks } = detailedDiff;

  return (
    <div className="animate-fade-in flex flex-col gap-3.5 flex-1 min-h-0 relative">
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Change Inspector Modal */}
      <ChangeInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        detailedDiff={detailedDiff}
        onJumpToHunk={handleJumpToHunk}
        onExportHtml={handleExportHtml}
        onCopyChangelog={handleCopyMarkdown}
        activeHunkId={activeHunkId}
      />

      {/* Control bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-4 shrink-0 transition-all duration-300">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Language Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Language</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="py-1 px-3 pr-8"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Sample Presets Dropdown */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <FolderOpen size={11} className="text-[#ff6b00]" />
              Samples
            </span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  handleLoadPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              className="py-1 px-3 pr-8"
            >
              <option value="" disabled>Load Sample Preset...</option>
              {DIFF_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.title}</option>
              ))}
            </select>
          </div>

          {/* Layout Split / Unified Toggle */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Layout</span>
            <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5">
              <button 
                onClick={() => setSplitView(true)}
                className={`p-1 px-2.5 rounded-md transition-all btn-spring flex items-center justify-center gap-1.5 ${
                  splitView 
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold border border-black dark:border-zinc-200 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-transparent'
                }`}
                title="Side-by-side Split View"
              >
                <Columns size={13} />
                <span className="text-[10px] font-bold font-mono">Split</span>
              </button>
              <button 
                onClick={() => setSplitView(false)}
                className={`p-1 px-2.5 rounded-md transition-all btn-spring flex items-center justify-center gap-1.5 ${
                  !splitView 
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold border border-black dark:border-zinc-200 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white border border-transparent'
                }`}
                title="Unified Inline View"
              >
                <Rows size={13} />
                <span className="text-[10px] font-bold font-mono">Unified</span>
              </button>
            </div>
          </div>

          {/* Quick Toggles: Whitespace, Case & Wrap */}
          <div className="flex items-center gap-3 pt-2 md:pt-4">
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={ignoreWhitespace} 
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-zinc-300 text-[#ff6b00] accent-[#ff6b00] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <EyeOff size={12} className="text-zinc-400" />
                Ignore WS
              </span>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={ignoreCase} 
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-zinc-300 text-[#ff6b00] accent-[#ff6b00] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Type size={12} className="text-zinc-400" />
                Ignore Case
              </span>
            </label>

            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={wordWrap} 
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded border-zinc-300 text-[#ff6b00] accent-[#ff6b00] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <WrapText size={12} className="text-zinc-400" />
                Wrap
              </span>
            </label>
          </div>
        </div>

        {/* Toolbar Utility Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Primary Feature: Inspect Changes Button */}
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="btn-primary py-1.5 px-3 btn-spring flex items-center gap-1.5 animate-pulse-glow"
            title="Open Detailed What Changed Inspector"
          >
            <Sparkles size={13} />
            <span className="text-xs font-extrabold">What Changed ({hunks.length})</span>
          </button>

          <button 
            onClick={handleShareLink} 
            className="btn-secondary py-1.5 px-2.5 btn-spring flex items-center gap-1.5"
            title="Create shareable compressed URL link"
          >
            <Share2 size={13} className="text-[#ff6b00]" />
            <span className="text-xs hidden sm:inline">Share</span>
          </button>

          <button 
            onClick={handleCopyMarkdown} 
            className="btn-secondary py-1.5 px-2.5 btn-spring flex items-center gap-1.5"
            title="Copy GitHub Markdown PR notes"
          >
            <Copy size={13} />
            <span className="text-xs hidden sm:inline">Copy PR</span>
          </button>

          <button 
            onClick={handleExportHtml} 
            className="btn-secondary py-1.5 px-2.5 btn-spring flex items-center gap-1.5"
            title="Download interactive standalone HTML diff report"
          >
            <FileCode2 size={13} className="text-[#ff6b00]" />
            <span className="text-xs hidden md:inline">HTML Report</span>
          </button>

          <button 
            onClick={handleDownloadPatch} 
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Download unified .patch file"
          >
            <Download size={13} />
          </button>

          <button onClick={handleSwap} className="btn-secondary py-1.5 px-2.5 btn-spring" title="Swap Panels">
            <ArrowLeftRight size={13} />
          </button>
          
          <button onClick={handleClear} className="btn-secondary py-1.5 px-2.5 btn-spring text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50/20" title="Clear All">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Diff Metrics HUD (Heads-Up Display) with Diff Navigator */}
      <div className="card p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Similarity & Animated Status Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Similarity:</span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
              <span className="font-extrabold text-[#ff6b00]">{stats.similarity}%</span>
              <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${stats.similarity === 100 ? 'bg-green-500' : 'bg-[#ff6b00]'}`}
                  style={{ width: `${stats.similarity}%` }}
                />
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

          {/* Additions & Deletions Counter */}
          <div className="flex items-center gap-2.5 font-bold">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
              +{stats.additions} lines
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              -{stats.deletions} lines
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              ~{stats.modifiedCount} modified
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-normal hidden lg:inline">
              ({stats.originalLines} orig / {stats.modifiedLines} mod)
            </span>
          </div>
        </div>

        {/* Diff Navigation Controls (Prev/Next Diff) & Match Status */}
        <div className="flex items-center gap-3">
          
          {/* Difference Navigator */}
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handlePrevDiff}
              disabled={hunks.length === 0}
              className="p-1 px-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Difference (Shift + F7)"
            >
              <ChevronLeft size={13} />
            </button>

            <span className="text-[11px] font-mono font-bold px-2 text-zinc-600 dark:text-zinc-400">
              {hunks.length > 0 ? `${activeHunkIndex + 1} of ${hunks.length}` : '0 Diffs'}
            </span>

            <button
              onClick={handleNextDiff}
              disabled={hunks.length === 0}
              className="p-1 px-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Difference (F7)"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Match status indicator */}
          <div className="flex items-center gap-1.5">
            {isIdentical ? (
              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-[11px]">
                <Check size={12} />
                Files Identical
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#ff6b00] font-bold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
                {hunks.length} Differences
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Editor Panels Info & Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        {/* Original Code Header */}
        <div className="card p-2 px-4 flex items-center justify-between dark-terminal-header border-b-0 rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <FileText size={15} className="text-zinc-400" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">Original Code</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="btn-terminal cursor-pointer btn-spring">
              <Upload size={12} className="mr-1" />
              Upload
              <input 
                type="file" 
                onChange={(e) => handleFileUpload(e, 'original')}
                className="hidden" 
                accept=".txt,.js,.jsx,.ts,.tsx,.json,.css,.html,.sql,.py,.java,.cpp,.cc,.h,.cs,.php,.go,.rs,.rb,.swift,.kt,.dart,.r,.pl,.scala,.lua,.md,.sh,.xml,.yaml,.yml"
              />
            </label>
            <button 
              onClick={() => copyToClipboard(originalCode, setCopiedOriginal, 'Original code copied')} 
              className="btn-terminal btn-spring"
            >
              {copiedOriginal ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              <span className="ml-1">{copiedOriginal ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modified Code Header */}
        <div className="card p-2 px-4 flex items-center justify-between dark-terminal-header border-b-0 rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <FileText size={15} className="text-zinc-400" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">Modified Code</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="btn-terminal cursor-pointer btn-spring">
              <Upload size={12} className="mr-1" />
              Upload
              <input 
                type="file" 
                onChange={(e) => handleFileUpload(e, 'modified')}
                className="hidden"
                accept=".txt,.js,.jsx,.ts,.tsx,.json,.css,.html,.sql,.py,.java,.cpp,.cc,.h,.cs,.php,.go,.rs,.rb,.swift,.kt,.dart,.r,.pl,.scala,.lua,.md,.sh,.xml,.yaml,.yml"
              />
            </label>
            <button 
              onClick={() => copyToClipboard(modifiedCode, setCopiedModified, 'Modified code copied')} 
              className="btn-terminal btn-spring"
            >
              {copiedModified ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              <span className="ml-1">{copiedModified ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="card dark-editor-card flex-1 min-h-0 border-t-0 rounded-t-none relative">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          onMount={handleEditorMount}
          loading={<EditorSkeleton label="Aligning Diff Syntax Trees..." />}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          options={{
            originalEditable: true,
            readOnly: false,
            renderSideBySide: splitView,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineHeight: 18,
            fontFamily: "'JetBrains Mono', monospace",
            automaticLayout: true,
            ignoreTrimWhitespace: ignoreWhitespace,
            diffWordWrap: wordWrap ? 'on' : 'off',
            wordWrap: wordWrap ? 'on' : 'off',
            padding: { top: 8, bottom: 8 }
          }}
        />
      </div>
    </div>
  );
}
