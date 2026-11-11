import React, { useRef, useEffect } from 'react';
import { Copy, Check, Upload, Trash2, ClipboardPaste } from 'lucide-react';

interface MobileCodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language?: string;
  onFileUpload?: (content: string, filename: string) => void;
  title?: string;
}

export const MobileCodeEditor: React.FC<MobileCodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Tap here to type or paste code...',
  language,
  onFileUpload,
  title
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const lines = value ? value.split('\n') : [''];
  const lineCount = Math.max(1, lines.length);

  // Sync line numbers scroll with textarea scroll
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    if (readOnly || !onChange) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch {
      // Fallback: focus textarea so native paste tooltip appears
      textareaRef.current?.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text && onFileUpload) {
        onFileUpload(text, file.name);
      } else if (text && onChange) {
        onChange(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly || !onChange) return;
    // Support Tab key to indent 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Mini Action Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0 select-none">
        <div className="flex items-center gap-2">
          {title && (
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              {title}
            </span>
          )}
          {language && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-[#ff6b00] font-bold">
              {language}
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-400">
            {lineCount} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!readOnly && onChange && (
            <>
              <button
                type="button"
                onClick={handlePaste}
                className="btn-terminal py-0.5 px-2 text-[10px] font-mono font-bold flex items-center gap-1 btn-spring"
                title="Paste from clipboard"
              >
                <ClipboardPaste size={11} className="text-[#ff6b00]" />
                <span>Paste</span>
              </button>

              <label className="btn-terminal py-0.5 px-2 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer btn-spring">
                <Upload size={11} />
                <span>Upload</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".txt,.js,.jsx,.ts,.tsx,.json,.css,.html,.sql,.py,.java,.cpp,.cc,.h,.cs,.php,.go,.rs,.rb,.swift,.kt,.dart,.r,.pl,.scala,.lua,.md,.sh,.xml,.yaml,.yml"
                />
              </label>

              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 text-zinc-400 hover:text-red-500 rounded"
                title="Clear"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="btn-terminal py-0.5 px-2 text-[10px] font-mono font-bold flex items-center gap-1 btn-spring disabled:opacity-40"
            title="Copy all code"
          >
            {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body: Line numbers + Native Touch Textarea */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden bg-white dark:bg-zinc-950">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-10 sm:w-12 bg-zinc-50 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800 select-none overflow-hidden py-3 text-right pr-2 shrink-0 pointer-events-none"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className="font-mono text-[11px] leading-[18px] text-zinc-400 dark:text-zinc-600 h-[18px]"
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          wrap="off"
          className="flex-1 min-h-0 w-full h-full p-3 font-mono text-[12px] leading-[18px] bg-transparent text-zinc-900 dark:text-zinc-100 outline-none resize-none overflow-auto select-text touch-scroll"
          style={{
            tabSize: 2,
            fontFamily: "'JetBrains Mono', monospace"
          }}
        />
      </div>
    </div>
  );
};

export default MobileCodeEditor;
