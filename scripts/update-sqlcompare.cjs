const fs = require('fs');
const path = 'src/components/SqlCompare.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import MobileCodeEditor from './MobileCodeEditor';")) {
  code = code.replace(
    "import ToastContainer, { type ToastMessage } from './Toast';",
    "import ToastContainer, { type ToastMessage } from './Toast';\nimport MobileCodeEditor from './MobileCodeEditor';\nimport MobileDiffViewer from './MobileDiffViewer';"
  );
}

if (!code.includes("const [mobileTab, setMobileTab] = useState")) {
  code = code.replace(
    "const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);",
    "const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);\n  const [mobileTab, setMobileTab] = useState<'original' | 'modified' | 'diff'>('diff');"
  );
}

const startTag = '{/* SQL Headers */}';
const startIdx = code.indexOf(startTag);
if (startIdx === -1) {
  console.error('startIdx not found in SqlCompare');
  process.exit(1);
}

const endPattern = '</div>\n    </div>\n  );\n}';
const endIdx = code.lastIndexOf(endPattern);
if (endIdx === -1) {
  console.error('endIdx not found in SqlCompare');
  process.exit(1);
}

const before = code.slice(0, startIdx);
const after = code.slice(endIdx + '</div>'.length);

const middle = `{/* Mobile Workspace Mode vs Desktop Monaco Mode */}
      {isMobile ? (
        <div className="flex flex-col flex-1 min-h-0 gap-2">
          {/* Mobile Tab Segmented Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0 select-none">
            <button
              onClick={() => setMobileTab('original')}
              className={\`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1.5 \${
                mobileTab === 'original' 
                  ? 'bg-[#ff6b00] text-white shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }\`}
            >
              <Database size={13} />
              <span>Original SQL</span>
            </button>
            <button
              onClick={() => setMobileTab('modified')}
              className={\`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1.5 \${
                mobileTab === 'modified' 
                  ? 'bg-[#ff6b00] text-white shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }\`}
            >
              <Database size={13} />
              <span>Modified SQL</span>
            </button>
            <button
              onClick={() => setMobileTab('diff')}
              className={\`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center flex items-center justify-center gap-1.5 \${
                mobileTab === 'diff' 
                  ? 'bg-[#ff6b00] text-white shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }\`}
            >
              <ArrowLeftRight size={13} />
              <span>Diff ({hunks.length})</span>
            </button>
          </div>

          {/* Active Mobile Panel */}
          {mobileTab === 'original' && (
            <MobileCodeEditor
              title="Original SQL"
              value={originalSql}
              onChange={(val) => {
                setOriginalSql(val);
                if (diffEditorRef.current) {
                  diffEditorRef.current.getOriginalEditor().setValue(val);
                }
              }}
              language="sql"
              onFileUpload={(content) => {
                setOriginalSql(content);
                if (diffEditorRef.current) {
                  diffEditorRef.current.getOriginalEditor().setValue(content);
                }
              }}
            />
          )}

          {mobileTab === 'modified' && (
            <MobileCodeEditor
              title="Modified SQL"
              value={modifiedSql}
              onChange={(val) => {
                setModifiedSql(val);
                if (diffEditorRef.current) {
                  diffEditorRef.current.getModifiedEditor().setValue(val);
                }
              }}
              language="sql"
              onFileUpload={(content) => {
                setModifiedSql(content);
                if (diffEditorRef.current) {
                  diffEditorRef.current.getModifiedEditor().setValue(content);
                }
              }}
            />
          )}

          {mobileTab === 'diff' && (
            <MobileDiffViewer
              detailedDiff={detailedDiff}
              originalCode={displayOriginal}
              modifiedCode={displayModified}
            />
          )}
        </div>
      ) : (
        /* Desktop Monaco Diff Workspace */
        <>
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
          <div className="card dark-editor-card flex-1 min-h-0 border-t-0 rounded-t-none relative">
            <DiffEditor
              height="100%"
              language="sql"
              original={displayOriginal}
              modified={displayModified}
              onMount={handleEditorMount}
              loading={<EditorSkeleton label="Analyzing SQL Dialects & Schemas..." />}
              theme={theme === 'dark' ? 'vs-dark' : 'vs'}
              options={{
                originalEditable: true,
                readOnly: false,
                renderSideBySide: splitView,
                minimap: { enabled: !isMobile },
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
                wordWrap: 'on',
                padding: { top: 8, bottom: 8 }
              }}
            />
          </div>
        </>
      )}`;

const newCode = before + middle + after;
fs.writeFileSync(path, newCode, 'utf8');
console.log('Successfully updated SqlCompare.tsx');
