import { useState, useEffect, useMemo } from 'react';
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
  Download,
  Regex as RegexIcon,
  ListOrdered,
  Sparkles,
  ArrowDownAZ,
  ArrowUpAZ,
  HelpCircle
} from 'lucide-react';

export type ToolCategory = 
  | 'json' 
  | 'regex'
  | 'text-tools'
  | 'base64' 
  | 'url' 
  | 'case' 
  | 'hash' 
  | 'jwt' 
  | 'scratchpad';

interface DevToolboxProps {
  initialTool?: ToolCategory;
}

const REGEX_PRESETS = [
  { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
  { name: 'URL / Web Link', pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)', flags: 'gi' },
  { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g' },
  { name: 'UUID v4', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}', flags: 'gi' },
  { name: 'ISO 8601 Date', pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})?)?', flags: 'g' },
  { name: 'Hex Color Code', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi' },
  { name: 'Phone Number (Intl / US)', pattern: '(?:\\+?\\d{1,3}[-.\\s]?)?(?:\\(?\\d{3}\\)?[-.\\s]?)?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
  { name: 'HTML / XML Tag', pattern: '<(\\/?[a-zA-Z][a-zA-Z0-9]*)(?:\\s+[^>]*)?>', flags: 'g' },
  { name: 'Alphanumeric Slug', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: 'i' }
];

export default function DevToolbox({ initialTool = 'json' }: DevToolboxProps) {
  const [activeTool, setActiveTool] = useState<ToolCategory>(initialTool);
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Update activeTool if initialTool changes externally (e.g. from command palette)
  useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  // Scratchpad state
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('align-dev-scratchpad') || '# Align Scratchpad\n- Auto-saved locally\n- Safe & offline\n';
  });

  useEffect(() => {
    localStorage.setItem('align-dev-scratchpad', scratchpad);
  }, [scratchpad]);

  // Regex Lab States
  const [regexPattern, setRegexPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [regexFlags, setRegexFlags] = useState({ g: true, i: true, m: false, s: false });
  const [regexTestStr, setRegexTestStr] = useState(
    'Contact support at help@alignstudio.dev or hello@vaptechsol.com for questions.\nBackup email: dev-ops_team@domain.co.uk'
  );
  const [showRegexCheatsheet, setShowRegexCheatsheet] = useState(false);

  // Text & List Tools States
  const [textToolInput, setTextToolInput] = useState(
    'banana\napple\norange\napple\nbanana\ngrapes\nmango'
  );
  const [textPrefix, setTextPrefix] = useState('');
  const [textSuffix, setTextSuffix] = useState('');

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
      setOutputVal(`Decode Error: ${e.message}`);
    }
  };

  // 3. URL Operations
  const handleUrlEncode = () => {
    try {
      setOutputVal(encodeURIComponent(inputVal));
      setStatusMsg('URL Encoded ✨');
    } catch (e: any) {
      setOutputVal(`Error: ${e.message}`);
    }
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
  const convertCase = (type: string) => {
    if (!inputVal) return;
    let res = '';
    const words = inputVal.trim().split(/[\s_\-]+/);

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
      case 'pascal':
        res = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        break;
      case 'constant':
        res = words.map(w => w.toUpperCase()).join('_');
        break;
      case 'title':
        res = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      case 'upper':
        res = inputVal.toUpperCase();
        break;
      case 'lower':
        res = inputVal.toLowerCase();
        break;
    }
    setOutputVal(res);
    setStatusMsg(`Converted to ${type} ✨`);
  };

  // 5. Hash Generation
  const generateHash = async (algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512') => {
    try {
      const msgBuffer = new TextEncoder().encode(inputVal);
      const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutputVal(hashHex);
      setStatusMsg(`${algorithm} Generated ✨`);
    } catch (e: any) {
      setOutputVal(`Hash Error: ${e.message}`);
    }
  };

  // 6. JWT Decoder
  const decodeJwt = () => {
    try {
      const parts = inputVal.trim().split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT: must contain at least Header and Payload parts separated by dots.');
      }
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setOutputVal(JSON.stringify({ header, payload }, null, 2));
      setStatusMsg('JWT Decoded successfully ✨');
    } catch (e: any) {
      setOutputVal(`JWT Parse Error: ${e.message}`);
    }
  };

  // 7. Regex Lab Calculations
  const regexResults = useMemo(() => {
    if (!regexPattern) return { valid: false, error: 'Pattern is empty', matches: [] };

    try {
      const flagStr = Object.entries(regexFlags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join('');

      const rx = new RegExp(regexPattern, flagStr);
      const matches: Array<{ index: number; text: string; groups?: string[] }> = [];

      if (flagStr.includes('g')) {
        let match;
        let lastIdx = -1;
        while ((match = rx.exec(regexTestStr)) !== null) {
          if (match.index === lastIdx) {
            rx.lastIndex++; // prevent infinite loop on zero-width match
          }
          lastIdx = match.index;
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1)
          });
          if (matches.length > 500) break; // safety guard
        }
      } else {
        const match = rx.exec(regexTestStr);
        if (match) {
          matches.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1)
          });
        }
      }

      return { valid: true, error: null, matches };
    } catch (e: any) {
      return { valid: false, error: e.message, matches: [] };
    }
  }, [regexPattern, regexFlags, regexTestStr]);

  // 8. Text & List Tools Operations
  const textStats = useMemo(() => {
    const text = textToolInput;
    const lines = text ? text.split('\n') : [];
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    const words = text ? text.trim().split(/\s+/).filter(Boolean) : [];
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const bytes = new Blob([text]).size;
    return {
      lines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      words: words.length,
      chars,
      charsNoSpace,
      bytes
    };
  }, [textToolInput]);

  const sortLines = (mode: 'asc' | 'desc' | 'length-asc' | 'length-desc' | 'natural') => {
    const lines = textToolInput.split('\n');
    let sorted = [...lines];

    switch (mode) {
      case 'asc':
        sorted.sort((a, b) => a.localeCompare(b));
        break;
      case 'desc':
        sorted.sort((a, b) => b.localeCompare(a));
        break;
      case 'length-asc':
        sorted.sort((a, b) => a.length - b.length || a.localeCompare(b));
        break;
      case 'length-desc':
        sorted.sort((a, b) => b.length - a.length || a.localeCompare(b));
        break;
      case 'natural':
        sorted.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        break;
    }
    setTextToolInput(sorted.join('\n'));
    setStatusMsg(`Lines sorted (${mode}) ✨`);
  };

  const deduplicateLines = () => {
    const lines = textToolInput.split('\n');
    const unique = Array.from(new Set(lines));
    const removed = lines.length - unique.length;
    setTextToolInput(unique.join('\n'));
    setStatusMsg(`Removed ${removed} duplicate line(s) ✨`);
  };

  const removeEmptyLines = () => {
    const lines = textToolInput.split('\n').filter(l => l.trim().length > 0);
    setTextToolInput(lines.join('\n'));
    setStatusMsg('Removed blank lines ✨');
  };

  const trimAllLines = () => {
    const lines = textToolInput.split('\n').map(l => l.trim());
    setTextToolInput(lines.join('\n'));
    setStatusMsg('Trimmed whitespace on all lines ✨');
  };

  const addLineNumbers = (format: '1.' | '01.' | '#') => {
    const lines = textToolInput.split('\n');
    const padLen = String(lines.length).length;
    const numbered = lines.map((line, idx) => {
      const num = idx + 1;
      if (format === '01.') {
        return `${String(num).padStart(padLen, '0')}. ${line}`;
      } else if (format === '#') {
        return `#${num} ${line}`;
      }
      return `${num}. ${line}`;
    });
    setTextToolInput(numbered.join('\n'));
    setStatusMsg('Added line numbers ✨');
  };

  const applyPrefixSuffix = () => {
    const lines = textToolInput.split('\n');
    const modified = lines.map(line => `${textPrefix}${line}${textSuffix}`);
    setTextToolInput(modified.join('\n'));
    setStatusMsg('Applied prefix and suffix ✨');
  };

  const wrapInQuotes = (quoteChar: '"' | "'") => {
    const lines = textToolInput.split('\n');
    const wrapped = lines.map(line => `${quoteChar}${line}${quoteChar}`);
    setTextToolInput(wrapped.join('\n'));
    setStatusMsg(`Wrapped in ${quoteChar} ✨`);
  };

  const toolTabs = [
    { id: 'json' as ToolCategory, label: 'JSON Studio', icon: FileJson },
    { id: 'regex' as ToolCategory, label: 'Regex Lab', icon: RegexIcon },
    { id: 'text-tools' as ToolCategory, label: 'Text & Lists', icon: ListOrdered },
    { id: 'base64' as ToolCategory, label: 'Base64', icon: Binary },
    { id: 'url' as ToolCategory, label: 'URL Encode', icon: Link2 },
    { id: 'case' as ToolCategory, label: 'Case Convert', icon: Type },
    { id: 'hash' as ToolCategory, label: 'Hash & SHA', icon: ShieldCheck },
    { id: 'jwt' as ToolCategory, label: 'JWT Inspector', icon: KeyRound },
    { id: 'scratchpad' as ToolCategory, label: 'Scratchpad', icon: FileEdit }
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-4 flex-1 min-h-0 overflow-hidden select-none">
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
      {activeTool === 'regex' ? (
        /* REGEX LAB VIEW */
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Regex Control Bar */}
          <div className="card p-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Pattern Input */}
              <div className="flex-1 min-w-[280px] flex items-center bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus-within:border-[#ff6b00]">
                <span className="font-mono text-sm text-[#ff6b00] font-bold select-none mr-1.5">/</span>
                <input
                  type="text"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  placeholder="Regular expression pattern..."
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-zinc-900 dark:text-zinc-100"
                />
                <span className="font-mono text-sm text-[#ff6b00] font-bold select-none ml-1.5">/</span>
              </div>

              {/* Flags Toggles */}
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
                {(['g', 'i', 'm', 's'] as const).map(flag => (
                  <button
                    key={flag}
                    onClick={() => setRegexFlags(prev => ({ ...prev, [flag]: !prev[flag] }))}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      regexFlags[flag]
                        ? 'bg-[#ff6b00] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                    title={`Flag: ${flag}`}
                  >
                    {flag}
                  </button>
                ))}
              </div>

              {/* Presets Select */}
              <select
                onChange={(e) => {
                  const preset = REGEX_PRESETS.find(p => p.name === e.target.value);
                  if (preset) {
                    setRegexPattern(preset.pattern);
                    setRegexFlags({
                      g: preset.flags.includes('g'),
                      i: preset.flags.includes('i'),
                      m: preset.flags.includes('m'),
                      s: preset.flags.includes('s'),
                    });
                  }
                }}
                defaultValue=""
                className="text-xs font-mono py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                <option value="" disabled>Load Regex Preset...</option>
                {REGEX_PRESETS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>

              {/* Cheatsheet Toggle */}
              <button
                onClick={() => setShowRegexCheatsheet(!showRegexCheatsheet)}
                className={`btn-secondary py-1.5 px-2.5 text-xs font-mono flex items-center gap-1.5 ${
                  showRegexCheatsheet ? 'border-[#ff6b00] text-[#ff6b00]' : ''
                }`}
                title="Toggle Cheatsheet"
              >
                <HelpCircle size={13} />
                <span>Cheatsheet</span>
              </button>
            </div>

            {/* Error or Matches Status */}
            <div className="flex items-center justify-between text-xs font-mono">
              {!regexResults.valid ? (
                <span className="text-red-500 font-bold">Regex Syntax Error: {regexResults.error}</span>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[#ff6b00] font-bold">
                    <Sparkles size={12} />
                    {regexResults.matches.length} Match{regexResults.matches.length === 1 ? '' : 'es'} Found
                  </span>
                  <span className="text-zinc-400">Length: {regexTestStr.length} chars</span>
                </div>
              )}
            </div>
          </div>

          {/* Cheatsheet Collapsible Drawer */}
          {showRegexCheatsheet && (
            <div className="card p-3 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-[11px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div><strong className="text-[#ff6b00]">\d</strong>: Any digit (0-9)</div>
              <div><strong className="text-[#ff6b00]">\w</strong>: Word char (a-z, 0-9, _)</div>
              <div><strong className="text-[#ff6b00]">\s</strong>: Whitespace (space, tab, nl)</div>
              <div><strong className="text-[#ff6b00]">^ / $</strong>: Start / End of line</div>
              <div><strong className="text-[#ff6b00]">.</strong>: Any char (except newline)</div>
              <div><strong className="text-[#ff6b00]">* / + / ?</strong>: 0+, 1+, 0 or 1</div>
              <div><strong className="text-[#ff6b00]">&#123;n,m&#125;</strong>: Between n & m times</div>
              <div><strong className="text-[#ff6b00]">(...)</strong>: Capture group</div>
            </div>
          )}

          {/* Test String and Match Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Test String Input */}
            <div className="card flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
                <span>Test String</span>
                <button onClick={() => setRegexTestStr('')} className="btn-terminal btn-spring text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
              <textarea
                value={regexTestStr}
                onChange={(e) => setRegexTestStr(e.target.value)}
                placeholder="Paste sample text to test matches against..."
                className="flex-1 w-full p-3 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100 select-text"
              />
            </div>

            {/* Matches Table / Output */}
            <div className="card flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
                <span>Match Details & Capture Groups</span>
                <button 
                  onClick={() => copyToClipboard(regexResults.matches.map(m => m.text).join('\n'))} 
                  className="btn-terminal btn-spring"
                  disabled={regexResults.matches.length === 0}
                >
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>Copy Matches</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 select-text">
                {regexResults.matches.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-400">
                    No matches found in test string.
                  </div>
                ) : (
                  regexResults.matches.map((m, idx) => (
                    <div 
                      key={idx} 
                      className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#ff6b00] uppercase tracking-wider">
                          Match #{idx + 1} • Index {m.index}
                        </span>
                        <span className="text-[10px] text-zinc-400">{m.text.length} chars</span>
                      </div>
                      <div className="p-1.5 px-2 rounded bg-orange-500/10 border border-orange-500/20 text-zinc-900 dark:text-zinc-100 font-bold break-all">
                        {m.text}
                      </div>
                      {m.groups && m.groups.length > 0 && (
                        <div className="mt-1 flex flex-col gap-0.5 pl-2 border-l-2 border-zinc-300 dark:border-zinc-700 text-[10px] text-zinc-500">
                          {m.groups.map((grp, gIdx) => (
                            <span key={gIdx}>
                              Group ${gIdx + 1}: <strong className="text-zinc-700 dark:text-zinc-300">{grp ?? 'undefined'}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTool === 'text-tools' ? (
        /* TEXT & LIST TOOLS VIEW */
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Operations Toolbar */}
          <div className="card p-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Sorting Group */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase mr-1">Sort:</span>
                <button onClick={() => sortLines('asc')} className="btn-secondary py-1 px-2 text-xs font-mono" title="A to Z">
                  <ArrowDownAZ size={13} className="mr-1" /> A-Z
                </button>
                <button onClick={() => sortLines('desc')} className="btn-secondary py-1 px-2 text-xs font-mono" title="Z to A">
                  <ArrowUpAZ size={13} className="mr-1" /> Z-A
                </button>
                <button onClick={() => sortLines('length-asc')} className="btn-secondary py-1 px-2 text-xs font-mono" title="Shortest First">
                  Shortest
                </button>
                <button onClick={() => sortLines('length-desc')} className="btn-secondary py-1 px-2 text-xs font-mono" title="Longest First">
                  Longest
                </button>
                <button onClick={() => sortLines('natural')} className="btn-secondary py-1 px-2 text-xs font-mono" title="Natural / Numeric Sort">
                  Natural
                </button>
              </div>

              {/* Dedupe & Clean Group */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase mr-1">Clean:</span>
                <button onClick={deduplicateLines} className="btn-secondary py-1 px-2 text-xs font-mono" title="Remove duplicates">
                  Deduplicate
                </button>
                <button onClick={removeEmptyLines} className="btn-secondary py-1 px-2 text-xs font-mono" title="Remove empty lines">
                  Remove Blank
                </button>
                <button onClick={trimAllLines} className="btn-secondary py-1 px-2 text-xs font-mono" title="Trim whitespace on all lines">
                  Trim Whitespace
                </button>
              </div>
            </div>

            {/* Line Numbering & Formatting Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase mr-1">Numbering:</span>
                <button onClick={() => addLineNumbers('1.')} className="btn-secondary py-1 px-2 text-xs font-mono">1. List</button>
                <button onClick={() => addLineNumbers('01.')} className="btn-secondary py-1 px-2 text-xs font-mono">01. List</button>
                <button onClick={() => wrapInQuotes('"')} className="btn-secondary py-1 px-2 text-xs font-mono">"Quote"</button>
                <button onClick={() => wrapInQuotes("'")} className="btn-secondary py-1 px-2 text-xs font-mono">'Single'</button>
              </div>

              {/* Prefix / Suffix Injector */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={textPrefix}
                  onChange={e => setTextPrefix(e.target.value)}
                  placeholder="Prefix..."
                  className="w-20 px-2 py-1 text-xs font-mono border rounded border-zinc-300 dark:border-zinc-700 bg-transparent"
                />
                <input
                  type="text"
                  value={textSuffix}
                  onChange={e => setTextSuffix(e.target.value)}
                  placeholder="Suffix..."
                  className="w-20 px-2 py-1 text-xs font-mono border rounded border-zinc-300 dark:border-zinc-700 bg-transparent"
                />
                <button onClick={applyPrefixSuffix} className="btn-secondary py-1 px-2 text-xs font-mono">Apply</button>
              </div>
            </div>
          </div>

          {/* Metrics HUD */}
          <div className="card p-2 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center gap-4 flex-wrap">
              <span>Lines: <strong className="text-[#ff6b00]">{textStats.lines}</strong></span>
              <span>Non-empty: <strong className="text-zinc-900 dark:text-zinc-100">{textStats.nonEmptyLines}</strong></span>
              <span>Words: <strong className="text-zinc-900 dark:text-zinc-100">{textStats.words}</strong></span>
              <span>Characters: <strong className="text-zinc-900 dark:text-zinc-100">{textStats.chars}</strong></span>
              <span>Bytes: <strong className="text-zinc-900 dark:text-zinc-100">{textStats.bytes} B</strong></span>
            </div>
            {statusMsg && <span className="text-[#ff6b00] font-bold">{statusMsg}</span>}
          </div>

          {/* Main Text Editor Pane */}
          <div className="card flex-1 min-h-0 flex flex-col overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="p-2.5 px-4 dark-terminal-header border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono font-bold">
              <span>List & Text Buffer</span>
              <div className="flex items-center gap-2">
                <button onClick={() => copyToClipboard(textToolInput)} className="btn-terminal btn-spring">
                  {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button onClick={() => setTextToolInput('')} className="btn-terminal btn-spring text-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <textarea
              value={textToolInput}
              onChange={e => setTextToolInput(e.target.value)}
              placeholder="Paste lines of text, lists, or logs here..."
              className="flex-1 w-full p-4 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100 select-text"
            />
          </div>
        </div>
      ) : activeTool === 'scratchpad' ? (
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
            className="flex-1 w-full p-4 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100 select-text"
            placeholder="Type or paste scratch notes, API keys, JSON payloads, or todos..."
          />
        </div>
      ) : (
        /* Standard 2-Pane Transform View (JSON, Base64, URL, Case, Hash, JWT) */
        <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
          {/* Action Header for current tool */}
          <div className="card p-3 px-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              {activeTool === 'json' && (
                <>
                  <button onClick={formatJson} className="btn-primary py-1 px-3 text-xs">Format JSON</button>
                  <button onClick={minifyJson} className="btn-secondary py-1 px-3 text-xs">Minify JSON</button>
                </>
              )}
              {activeTool === 'base64' && (
                <>
                  <button onClick={handleBase64Encode} className="btn-primary py-1 px-3 text-xs">Encode Base64</button>
                  <button onClick={handleBase64Decode} className="btn-secondary py-1 px-3 text-xs">Decode Base64</button>
                </>
              )}
              {activeTool === 'url' && (
                <>
                  <button onClick={handleUrlEncode} className="btn-primary py-1 px-3 text-xs">URL Encode</button>
                  <button onClick={handleUrlDecode} className="btn-secondary py-1 px-3 text-xs">URL Decode</button>
                </>
              )}
              {activeTool === 'case' && (
                <>
                  <button onClick={() => convertCase('camel')} className="btn-secondary py-1 px-2.5 text-xs">camelCase</button>
                  <button onClick={() => convertCase('kebab')} className="btn-secondary py-1 px-2.5 text-xs">kebab-case</button>
                  <button onClick={() => convertCase('snake')} className="btn-secondary py-1 px-2.5 text-xs">snake_case</button>
                  <button onClick={() => convertCase('pascal')} className="btn-secondary py-1 px-2.5 text-xs">PascalCase</button>
                  <button onClick={() => convertCase('constant')} className="btn-secondary py-1 px-2.5 text-xs">CONSTANT_CASE</button>
                  <button onClick={() => convertCase('title')} className="btn-secondary py-1 px-2.5 text-xs">Title Case</button>
                  <button onClick={() => convertCase('upper')} className="btn-secondary py-1 px-2 text-xs">UPPER</button>
                  <button onClick={() => convertCase('lower')} className="btn-secondary py-1 px-2 text-xs">lower</button>
                </>
              )}
              {activeTool === 'hash' && (
                <>
                  <button onClick={() => generateHash('SHA-256')} className="btn-primary py-1 px-3 text-xs">SHA-256</button>
                  <button onClick={() => generateHash('SHA-512')} className="btn-secondary py-1 px-3 text-xs">SHA-512</button>
                  <button onClick={() => generateHash('SHA-1')} className="btn-secondary py-1 px-3 text-xs">SHA-1</button>
                </>
              )}
              {activeTool === 'jwt' && (
                <>
                  <button onClick={decodeJwt} className="btn-primary py-1 px-3 text-xs">Decode Token</button>
                </>
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
                className="flex-1 w-full p-3 font-mono text-xs outline-none resize-none bg-transparent dark:text-zinc-100 select-text"
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
                className="flex-1 w-full p-3 font-mono text-xs outline-none resize-none bg-zinc-50/50 dark:bg-zinc-950/40 dark:text-zinc-100 text-zinc-900 select-text"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
