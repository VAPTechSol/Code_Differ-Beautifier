import React, { useState, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import EditorSkeleton from './EditorSkeleton';
import { 
  computeDiffStats, 
  generateMarkdownDiff, 
  downloadPatchFile, 
  encodeDiffShare, 
  decodeDiffShare 
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
  
  // Alphabetical list of others
  { value: 'ada', label: 'Ada' },
  { value: 'apex', label: 'Apex' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'cobol', label: 'COBOL' },
  { value: 'coffeescript', label: 'CoffeeScript' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'fsharp', label: 'F#' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lisp', label: 'Lisp' },
  { value: 'lua', label: 'Lua' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'objective-c', label: 'Objective-C' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'perl', label: 'Perl' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'r', label: 'R' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'scala', label: 'Scala' },
  { value: 'scheme', label: 'Scheme' },
  { value: 'shell', label: 'Shell / Bash' },
  { value: 'swift', label: 'Swift' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' }
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
  const [wordWrap, setWordWrap] = useState(true);

  const [originalCode, setOriginalCode] = useState('// Paste original code here\nfunction calculateTotal(price, tax) {\n  var result = price + tax;\n  return result;\n}');
  const [modifiedCode, setModifiedCode] = useState('// Paste modified code here\nconst calculateTotal = (price, tax) => {\n  if (!price) return 0;\n  return price + tax;\n};');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModified, setCopiedModified] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Sync settings back to localStorage
  React.useEffect(() => {
    localStorage.setItem('align-diff-language', language);
    localStorage.setItem('align-diff-split', String(splitView));
  }, [language, splitView]);

  // Decode shared link from URL hash on mount
  React.useEffect(() => {
    const shared = decodeDiffShare(window.location.hash);
    if (shared) {
      if (shared.original) setOriginalCode(shared.original);
      if (shared.modified) setModifiedCode(shared.modified);
      if (shared.lang) setLanguage(shared.lang);
      if (diffEditorRef.current) {
        diffEditorRef.current.getOriginalEditor().setValue(shared.original);
        diffEditorRef.current.getModifiedEditor().setValue(shared.modified);
      }
    }
  }, []);

  const diffEditorRef = useRef<any>(null);

  const diffStats = React.useMemo(() => {
    return computeDiffStats(originalCode, modifiedCode);
  }, [originalCode, modifiedCode]);

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
  };

  const handleClear = () => {
    setOriginalCode('');
    setModifiedCode('');
    if (diffEditorRef.current) {
      diffEditorRef.current.getOriginalEditor().setValue('');
      diffEditorRef.current.getModifiedEditor().setValue('');
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownDiff(originalCode, modifiedCode, `diff_${language}`);
    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2200);
  };

  const handleShareLink = () => {
    const encoded = encodeDiffShare(originalCode, modifiedCode, language);
    const url = `${window.location.origin}${window.location.pathname}#diff=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const handleDownloadPatch = () => {
    downloadPatchFile(originalCode, modifiedCode, `align_diff_${Date.now()}.patch`);
  };

  const isIdentical = originalCode.trim() === modifiedCode.trim();

  return (
    <div className="animate-fade-in flex flex-col gap-3.5 flex-1 min-h-0">
      {/* Control bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-5">
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
                title="Split View"
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
                title="Unified / Inline View"
              >
                <Rows size={13} />
                <span className="text-[10px] font-bold font-mono">Unified</span>
              </button>
            </div>
          </div>

          {/* Quick Toggles: Whitespace & Wrap */}
          <div className="flex items-center gap-4 pt-2 md:pt-0">
            <label className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
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

            <label className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={wordWrap} 
                onChange={(e) => setWordWrap(e.target.checked)}
                className="rounded border-zinc-300 text-[#ff6b00] accent-[#ff6b00] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <WrapText size={12} className="text-zinc-400" />
                Word Wrap
              </span>
            </label>
          </div>
        </div>

        {/* Toolbar Utility Actions */}
        <div className="flex items-center gap-2.5">
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
      <div className="card p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Similarity & Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Similarity:</span>
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
              Files Identical
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#ff6b00] font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-pulse" />
              Differences Detected
            </span>
          )}
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
              onClick={() => copyToClipboard(originalCode, setCopiedOriginal)} 
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
              onClick={() => copyToClipboard(modifiedCode, setCopiedModified)} 
              className="btn-terminal btn-spring"
            >
              {copiedModified ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              <span className="ml-1">{copiedModified ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="card dark-editor-card overflow-hidden flex-1 min-h-0 border-t-0 rounded-t-none">
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
            wordWrap: wordWrap ? 'on' : 'off'
          }}
        />
      </div>
    </div>
  );
}
