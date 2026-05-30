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
  FileText 
} from 'lucide-react';

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
  const [language, setLanguage] = useState('javascript');
  const [splitView, setSplitView] = useState(true);
  const [originalCode, setOriginalCode] = useState('// Paste original code here\nfunction calculateTotal(price, tax) {\n  var result = price + tax;\n  return result;\n}');
  const [modifiedCode, setModifiedCode] = useState('// Paste modified code here\nconst calculateTotal = (price, tax) => {\n  if (!price) return 0;\n  return price + tax;\n};');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedModified, setCopiedModified] = useState(false);

  const diffEditorRef = useRef<any>(null);

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

  return (
    <div className="animate-fade-in flex flex-col gap-4 flex-1 min-h-0">
      {/* Control bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Language</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="btn-secondary py-1.5 px-3 pr-8"
              style={{ appearance: 'auto' }}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Layout</span>
            <div className="flex border border-zinc-200 rounded-md overflow-hidden bg-white">
              <button 
                onClick={() => setSplitView(true)}
                className={`p-2 transition-colors ${splitView ? 'bg-zinc-100 text-black' : 'hover:bg-zinc-50 text-zinc-500'}`}
                title="Split View"
              >
                <Columns size={16} />
              </button>
              <button 
                onClick={() => setSplitView(false)}
                className={`p-2 transition-colors ${!splitView ? 'bg-zinc-100 text-black' : 'hover:bg-zinc-50 text-zinc-500'}`}
                title="Unified / Inline View"
              >
                <Rows size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSwap} className="btn-secondary" title="Swap Panels">
            <ArrowLeftRight size={16} />
            <span>Swap</span>
          </button>
          
          <button onClick={handleClear} className="btn-secondary text-red-600 hover:text-red-700" title="Clear All">
            <Trash2 size={16} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Panels Info & Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Code Header */}
        <div className="card p-3 flex items-center justify-between dark-terminal-header">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <FileText size={16} className="text-zinc-400" />
            <span className="font-semibold text-sm">Original Code</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="btn-terminal cursor-pointer">
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
              className="btn-terminal"
            >
              {copiedOriginal ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              <span className="ml-1">{copiedOriginal ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modified Code Header */}
        <div className="card p-3 flex items-center justify-between dark-terminal-header">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <span className="window-dot window-dot-red"></span>
              <span className="window-dot window-dot-yellow"></span>
              <span className="window-dot window-dot-green"></span>
            </div>
            <FileText size={16} className="text-zinc-400" />
            <span className="font-semibold text-sm">Modified Code</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="btn-terminal cursor-pointer">
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
              className="btn-terminal"
            >
              {copiedModified ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              <span className="ml-1">{copiedModified ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="card dark-editor-card overflow-hidden flex-1 min-h-0">
        <DiffEditor
          height="100%"
          language={language}
          original={originalCode}
          modified={modifiedCode}
          onMount={handleEditorMount}
          theme="vs"
          options={{
            renderSideBySide: splitView,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            automaticLayout: true,
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
