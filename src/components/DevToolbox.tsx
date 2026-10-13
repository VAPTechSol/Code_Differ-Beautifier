import { useState, useEffect } from 'react';
import { 
  Wrench, 
  Copy, 
  Check, 
  Trash2, 
  ArrowLeftRight, 
  ShieldCheck, 
  FileJson, 
  Binary, 
  Link2, 
  Type, 
  KeyRound, 
  FileEdit,
  Download
} from 'lucide-react';

type ToolCategory = 'json' | 'base64' | 'url' | 'case' | 'hash' | 'jwt' | 'scratchpad';

export default function DevToolbox() {
  const [activeTool, setActiveTool] = useState<ToolCategory>('json');
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Scratchpad state
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('align-dev-scratchpad') || '# Align Scratchpad\n- Auto-saved locally\n- Safe & offline\n';
  });

  useEffect(() => {
    localStorage.setItem('align-dev-scratchpad', scratchpad);
  }, [scratchpad]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. JSON Operations
  const formatJson = () => {
    try {
      const parsed = JSON.parse(inputVal);
      setOutputVal(JSON.stringify(parsed, null, 2));
      setStatusMsg('JSON Formatted successfully ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
      setStatusMsg('Invalid JSON ❌');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(inputVal);
      setOutputVal(JSON.stringify(parsed));
      setStatusMsg('JSON Minified ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
      setStatusMsg('Invalid JSON ❌');
    }
  };

  // 2. Base64 Operations
  const handleBase64Encode = () => {
    try {
      setOutputVal(btoa(unescape(encodeURIComponent(inputVal))));
      setStatusMsg('Encoded to Base64 ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
    }
  };

  const handleBase64Decode = () => {
    try {
      setOutputVal(decodeURIComponent(escape(atob(inputVal))));
      setStatusMsg('Decoded from Base64 ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
      setStatusMsg('Invalid Base64 string ❌');
    }
  };

  // 3. URL Operations
  const handleUrlEncode = () => {
    setOutputVal(encodeURIComponent(inputVal));
    setStatusMsg('URL Encoded ✨');
  };

  const handleUrlDecode = () => {
    try {
      setOutputVal(decodeURIComponent(inputVal));
      setStatusMsg('URL Decoded ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
    }
  };

  // 4. Case Converter
  const convertCase = (type: 'camel' | 'snake' | 'kebab' | 'upper' | 'title') => {
    const words = inputVal.trim().replace(/[-_]/g, ' ').split(/\s+/);
    if (!words.length || !inputVal.trim()) return;

    let res = '';
    switch (type) {
      case 'camel':
        res = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'snake':
        res = words.map(w => w.toLowerCase()).join('_');
        break;
      case 'kebab':
        res = words.map(w => w.toLowerCase()).join('-');
        break;
      case 'upper':
        res = words.map(w => w.toUpperCase()).join('_');
        break;
      case 'title':
        res = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
    }
    setOutputVal(res);
    setStatusMsg(`Converted to ${type}Case ✨`);
  };

  // 5. Hash Generator
  const generateHash = async (algo: 'SHA-1' | 'SHA-256' | 'SHA-512') => {
    try {
      const msgBuffer = new TextEncoder().encode(inputVal);
      const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutputVal(hashHex);
      setStatusMsg(`${algo} generated ✨`);
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
    }
  };

  // 6. JWT Inspector
  const decodeJwt = () => {
    try {
      const parts = inputVal.trim().split('.');
      if (parts.length < 2) {
        setOutputVal('Error: JWT token must contain at least 2 segments separated by dots.');
        return;
      }
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setOutputVal(JSON.stringify({ header, payload }, null, 2));
      setStatusMsg('JWT Decoded successfully ✨');
    } catch (e: any) {
      setOutputVal(`JWT Parse Error: ${e.message}`);
    }
  };

  const toolTabs = [
    { id: 'json' as ToolCategory, label: 'JSON Studio', icon: FileJson },
    { id: 'base64' as ToolCategory, label: 'Base64', icon: Binary },
    { id: 'url' as ToolCategory, label: 'URL Encode', icon: Link2 },
    { id: 'case' as ToolCategory, label: 'Case Convert', icon: Type },
    { id: 'hash' as ToolCategory, label: 'Hash & SHA', icon: ShieldCheck },
    { id: 'jwt' as ToolCategory, label: 'JWT Inspector', icon: KeyRound },
    { id: 'scratchpad' as ToolCategory, label: 'Scratchpad', icon: FileEdit }
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
      {/* Tool Navigation Header */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-4 shrink-0 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#ff6b00] rounded-lg text-black font-bold">
            <Wrench size={16} />
          </span>
          <div>
            <h2 className="font-extrabold text-sm font-mono tracking-tight text-zinc-950 dark:text-zinc-50">
              Align Dev Toolbox
            </h2>
            <span className="text-[9px] text-zinc-400 font-mono font-bold">Zero-latency, client-side developer utilities</span>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          {toolTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTool(tab.id);
                  setStatusMsg('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all btn-spring ${
                  isActive
                    ? 'bg-[#ff6b00] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workbench Area */}
      {activeTool === 'scratchpad' ? (
        /* Scratchpad Full View */
        <div className="card flex-1 min-h-0 flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
            <span>Local Developer Scratchpad (Auto-saves locally)</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-normal">{scratchpad.length} chars | {scratchpad.split(/\s+/).filter(Boolean).length} words</span>
              <button onClick={() => copyToClipboard(scratchpad)} className="btn-terminal btn-spring">
                {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([scratchpad], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `notes_${Date.now()}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} 
                className="btn-terminal btn-spring"
                title="Download as Markdown"
              >
                <Download size={12} />
              </button>
              <button onClick={() => setScratchpad('')} className="btn-terminal btn-spring text-red-600" title="Clear Scratchpad">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100"
            placeholder="Type or paste scratch notes, API keys, JSON payloads, or todos..."
          />
        </div>
      ) : (
        /* Two-panel Transformer View */
        <div className="flex flex-col flex-1 min-h-0 gap-3.5">
          {/* Action Toolbar for Active Tool */}
          <div className="card p-2 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold shrink-0 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 flex-wrap">
              {activeTool === 'json' && (
                <>
                  <button onClick={formatJson} className="btn-primary py-1 px-3 btn-spring text-xs">Beautify JSON</button>
                  <button onClick={minifyJson} className="btn-secondary py-1 px-3 btn-spring text-xs">Minify JSON</button>
                </>
              )}

              {activeTool === 'base64' && (
                <>
                  <button onClick={handleBase64Encode} className="btn-primary py-1 px-3 btn-spring text-xs">Encode Base64</button>
                  <button onClick={handleBase64Decode} className="btn-secondary py-1 px-3 btn-spring text-xs">Decode Base64</button>
                </>
              )}

              {activeTool === 'url' && (
                <>
                  <button onClick={handleUrlEncode} className="btn-primary py-1 px-3 btn-spring text-xs">Encode URL</button>
                  <button onClick={handleUrlDecode} className="btn-secondary py-1 px-3 btn-spring text-xs">Decode URL</button>
                </>
              )}

              {activeTool === 'case' && (
                <>
                  <button onClick={() => convertCase('camel')} className="btn-secondary py-1 px-2.5 btn-spring text-xs">camelCase</button>
                  <button onClick={() => convertCase('snake')} className="btn-secondary py-1 px-2.5 btn-spring text-xs">snake_case</button>
                  <button onClick={() => convertCase('kebab')} className="btn-secondary py-1 px-2.5 btn-spring text-xs">kebab-case</button>
                  <button onClick={() => convertCase('upper')} className="btn-secondary py-1 px-2.5 btn-spring text-xs">UPPER_CASE</button>
                  <button onClick={() => convertCase('title')} className="btn-secondary py-1 px-2.5 btn-spring text-xs">Title Case</button>
                </>
              )}

              {activeTool === 'hash' && (
                <>
                  <button onClick={() => generateHash('SHA-256')} className="btn-primary py-1 px-3 btn-spring text-xs">SHA-256</button>
                  <button onClick={() => generateHash('SHA-512')} className="btn-secondary py-1 px-3 btn-spring text-xs">SHA-512</button>
                  <button onClick={() => generateHash('SHA-1')} className="btn-secondary py-1 px-3 btn-spring text-xs">SHA-1</button>
                </>
              )}

              {activeTool === 'jwt' && (
                <button onClick={decodeJwt} className="btn-primary py-1 px-3 btn-spring text-xs">Decode & Inspect JWT</button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {statusMsg && <span className="text-[#ff6b00] text-[11px] font-bold">{statusMsg}</span>}
              <button 
                onClick={() => {
                  const tmp = inputVal;
                  setInputVal(outputVal);
                  setOutputVal(tmp);
                }} 
                className="btn-secondary py-1 px-2.5 btn-spring text-xs flex items-center gap-1"
                title="Swap Input & Output"
              >
                <ArrowLeftRight size={12} />
                <span>Swap</span>
              </button>
              <button 
                onClick={() => {
                  setInputVal('');
                  setOutputVal('');
                  setStatusMsg('');
                }} 
                className="btn-secondary py-1 px-2 btn-spring text-red-600 hover:text-red-700"
                title="Clear"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Side-by-side Input and Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Input Box */}
            <div className="card flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
                <span>Input Payload</span>
                <span className="text-zinc-400 font-normal">{inputVal.length} chars</span>
              </div>
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Paste or type content here..."
                className="flex-1 w-full p-3 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100"
              />
            </div>

            {/* Output Box */}
            <div className="card flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
                <span>Output Result</span>
                <button onClick={() => copyToClipboard(outputVal)} className="btn-terminal btn-spring">
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={outputVal}
                placeholder="Transformed output appears here..."
                className="flex-1 w-full p-3 font-mono text-xs outline-none resize-none bg-zinc-50/50 dark:bg-zinc-950/40 dark:text-zinc-100 text-zinc-900"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
