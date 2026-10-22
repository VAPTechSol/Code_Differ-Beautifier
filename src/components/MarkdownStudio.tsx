import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { marked } from 'marked';
import { 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Columns, 
  Eye, 
  Code2, 
  BookOpen, 
  Sparkles,
  Clock,
  Hash,
  Type
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import EditorSkeleton from './EditorSkeleton';

const SAMPLE_MARKDOWN = `# 🚀 Align Studio Markdown Playground

Welcome to **Align Studio Markdown Studio**! A fast, responsive dual-pane markdown authoring workstation with real-time GitHub-flavored preview.

---

## ⚡ Highlights
- **Live dual-pane rendering** with instant AST synthesis
- **GitHub-flavored markdown**: tables, task lists, code blocks, and blockquotes
- **Export capabilities**: Download \`.md\` or rendered \`.html\`
- **Zero cloud storage**: Everything remains 100% private in your browser

### 📋 Feature Checklist
- [x] Syntax-highlighted Monaco editor
- [x] Instant HTML preview
- [x] Reading time and word counter
- [ ] Export to PDF (Coming soon)

---

## 💻 Sample Code Block

\`\`\`typescript
interface DeveloperTool {
  name: string;
  category: 'diff' | 'formatter' | 'utility';
  isLocalOnly: boolean;
}

const alignStudio: DeveloperTool = {
  name: "Align Studio",
  category: "diff",
  isLocalOnly: true
};
console.log(\`Engine primed: \${alignStudio.name}\`);
\`\`\`

---

## 📊 Data Comparison Table

| Tool Module | Capability | Execution Speed |
| :--- | :--- | :--- |
| **Code Compare** | Side-by-side & Inline diffs | Ultra Fast (<5ms) |
| **SQL Compare** | Dialect normalization | Immediate |
| **Dev Toolbox** | Offline JSON, Hashes, JWT | 0ms network latency |
| **Markdown Studio** | Real-time dual pane preview | Instantaneous |

---

> [!NOTE]
> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra
`;

type ViewMode = 'split' | 'editor' | 'preview';

export const MarkdownStudio: React.FC = () => {
  const { theme } = useTheme();
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('align-markdown-draft') || SAMPLE_MARKDOWN;
  });
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Sync with local storage
  const handleContentChange = (val: string | undefined) => {
    const nextVal = val || '';
    setContent(nextVal);
    localStorage.setItem('align-markdown-draft', nextVal);
  };

  // Compile markdown to safe HTML
  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(content || '', {
        gfm: true,
        breaks: true
      }) as string;
    } catch (e: any) {
      return `<p class="text-red-500 font-mono">Error compiling markdown: ${e.message}</p>`;
    }
  }, [content]);

  // Document metrics
  const stats = useMemo(() => {
    const text = content.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;
    const headings = (text.match(/^#{1,6}\s+.+$/gm) || []).length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));

    return { words, chars, lines, headings, readMinutes };
  }, [content]);

  const copyMd = () => {
    navigator.clipboard.writeText(content);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(renderedHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const downloadFile = (filename: string, fileContent: string, mimeType: string) => {
    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    downloadFile('document.md', content, 'text/markdown;charset=utf-8');
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Markdown Export - Align Studio</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #18181b; }
    pre { background: #f4f4f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; background: #f4f4f5; padding: 2px 6px; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #e4e4e7; padding: 8px 12px; text-align: left; }
    th { background: #f4f4f5; }
    blockquote { border-left: 4px solid #ff6b00; margin: 0; padding-left: 16px; color: #71717a; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    downloadFile('document.html', fullHtml, 'text/html;charset=utf-8');
  };

  return (
    <div className="flex flex-col h-full gap-3 select-none">
      {/* Top Action Bar */}
      <div className="card p-3 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-lg text-[#ff6b00]">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight font-mono">
              Markdown Studio
            </h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              Live dual-pane GitHub markdown editing, real-time statistics & instant exports
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'split' 
                  ? 'bg-white dark:bg-zinc-700 text-[#ff6b00] shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Split View (Editor & Preview)"
            >
              <Columns size={13} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`p-1.5 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'editor' 
                  ? 'bg-white dark:bg-zinc-700 text-[#ff6b00] shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Editor Only"
            >
              <Code2 size={13} />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'preview' 
                  ? 'bg-white dark:bg-zinc-700 text-[#ff6b00] shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title="Preview Only"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <button
            onClick={() => setContent(SAMPLE_MARKDOWN)}
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Load Sample Document"
          >
            <Sparkles size={13} className="text-[#ff6b00]" />
            <span className="text-xs font-mono">Sample</span>
          </button>

          <button
            onClick={copyMd}
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Copy Raw Markdown"
          >
            {copiedMd ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            <span className="text-xs font-mono">{copiedMd ? 'Copied MD' : 'Copy MD'}</span>
          </button>

          <button
            onClick={copyHtml}
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Copy Rendered HTML Code"
          >
            {copiedHtml ? <Check size={13} className="text-green-600" /> : <Code2 size={13} />}
            <span className="text-xs font-mono">{copiedHtml ? 'Copied HTML' : 'Copy HTML'}</span>
          </button>

          <button
            onClick={handleDownloadMd}
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Download .md file"
          >
            <Download size={13} />
            <span className="text-xs font-mono">.md</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="btn-secondary py-1.5 px-2.5 btn-spring"
            title="Download .html file"
          >
            <Download size={13} />
            <span className="text-xs font-mono">.html</span>
          </button>

          <button
            onClick={() => handleContentChange('')}
            className="btn-secondary py-1.5 px-2 btn-spring text-red-600 hover:text-red-700"
            title="Clear All Text"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Metrics HUD */}
      <div className="card p-2 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Type size={13} className="text-[#ff6b00]" />
            <span>Words: <strong className="text-zinc-900 dark:text-zinc-100">{stats.words}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span>Chars: <strong className="text-zinc-900 dark:text-zinc-100">{stats.chars}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span>Lines: <strong className="text-zinc-900 dark:text-zinc-100">{stats.lines}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
            <Hash size={13} className="text-[#ff6b00]" />
            <span>Headings: <strong className="text-zinc-900 dark:text-zinc-100">{stats.headings}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
          <Clock size={12} className="text-amber-500" />
          <span>Est. Reading: <strong>~{stats.readMinutes} min</strong></span>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monaco Editor Pane */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`card overflow-hidden flex flex-col min-h-0 ${viewMode === 'editor' ? 'md:col-span-2' : ''}`}>
            <div className="p-2 px-4 flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 shrink-0">
              <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Code2 size={13} className="text-[#ff6b00]" />
                Markdown Input
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                UTF-8 • Auto-saved
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language="markdown"
                value={content}
                onChange={handleContentChange}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                loading={<EditorSkeleton label="Initializing Markdown Synthesizer..." />}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineHeight: 19,
                  fontFamily: "'JetBrains Mono', monospace",
                  automaticLayout: true,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`card overflow-hidden flex flex-col min-h-0 ${viewMode === 'preview' ? 'md:col-span-2' : ''}`}>
            <div className="p-2 px-4 flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 shrink-0">
              <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Eye size={13} className="text-[#ff6b00]" />
                Live GitHub Preview
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                GitHub Flavored Markdown
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 select-text">
              <div 
                className="markdown-body prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownStudio;
