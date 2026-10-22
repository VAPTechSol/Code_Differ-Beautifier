import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  GitCompare, 
  Database, 
  Sparkles, 
  Wrench, 
  Smile, 
  Sun, 
  Moon, 
  FileEdit, 
  Binary, 
  Link2, 
  Type, 
  KeyRound, 
  ShieldCheck, 
  FileJson,
  Regex,
  ListOrdered,
  FileArchive
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Tools' | 'Dev Toolbox' | 'Actions' | 'Languages';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onNavigateToolbox?: (toolId: string) => void;
  onToggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigateToolbox,
  onToggleTheme,
  currentTheme
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global keydown handler for Escape & arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = [
    // Primary Tools
    {
      id: 'tab-diff',
      title: 'Code Compare',
      subtitle: 'Compare side-by-side or inline code diffs',
      category: 'Tools',
      icon: GitCompare,
      action: () => { onNavigateTab('diff'); onClose(); },
      keywords: ['compare', 'diff', 'code', 'merge', 'git']
    },
    {
      id: 'tab-sql',
      title: 'SQL Compare',
      subtitle: 'Smart dialect comparisons and Redgate formatters',
      category: 'Tools',
      icon: Database,
      action: () => { onNavigateTab('sql-compare'); onClose(); },
      keywords: ['sql', 'database', 'query', 'mysql', 'postgres', 'redgate']
    },
    {
      id: 'tab-beautifier',
      title: 'Code Beautifier',
      subtitle: 'Format JS, TS, HTML, CSS, JSON, SQL & Python',
      category: 'Tools',
      icon: Sparkles,
      action: () => { onNavigateTab('beautifier'); onClose(); },
      keywords: ['beautify', 'format', 'prettify', 'indent', 'clean']
    },
    {
      id: 'tab-markdown',
      title: 'Markdown Studio',
      subtitle: 'Live dual-pane Markdown editor with GitHub preview',
      category: 'Tools',
      icon: FileEdit,
      action: () => { onNavigateTab('markdown'); onClose(); },
      keywords: ['markdown', 'md', 'preview', 'readme', 'documentation']
    },
    {
      id: 'tab-toolbox',
      title: 'Dev Toolbox',
      subtitle: 'Multi-purpose offline developer utility collection',
      category: 'Tools',
      icon: Wrench,
      action: () => { onNavigateTab('toolbox'); onClose(); },
      keywords: ['toolbox', 'utilities', 'tools', 'dev']
    },
    {
      id: 'tab-destress',
      title: 'Destress Zone',
      subtitle: 'Relaxation mini-games and team coffee lounge',
      category: 'Tools',
      icon: Smile,
      action: () => { onNavigateTab('destress'); onClose(); },
      keywords: ['games', 'destress', 'fun', 'break', 'coffee', 'balloon']
    },

    // Dev Toolbox Sub-tools
    {
      id: 'tool-regex',
      title: 'Regex Lab',
      subtitle: 'Interactive regex pattern tester with capture groups',
      category: 'Dev Toolbox',
      icon: Regex,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('regex');
        onClose();
      },
      keywords: ['regex', 'regexp', 'regular expression', 'pattern', 'test', 'match']
    },
    {
      id: 'tool-text',
      title: 'Text & List Tools',
      subtitle: 'Sort lines, deduplicate, casing converters & line counters',
      category: 'Dev Toolbox',
      icon: ListOrdered,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('text-tools');
        onClose();
      },
      keywords: ['sort', 'dedupe', 'lines', 'case', 'trim', 'slug', 'casing', 'text']
    },
    {
      id: 'tool-gzip',
      title: 'Gzip Encrypt / Decrypt',
      subtitle: 'Compress & decompress Gzip/Deflate payloads (Base64 & Hex)',
      category: 'Dev Toolbox',
      icon: FileArchive,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('gzip');
        onClose();
      },
      keywords: ['gzip', 'gunzip', 'compress', 'decompress', 'encrypt', 'decrypt', 'deflate', 'archive', 'zip']
    },
    {
      id: 'tool-json',
      title: 'JSON Studio',
      subtitle: 'Validate, format, and minify JSON payloads',
      category: 'Dev Toolbox',
      icon: FileJson,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('json');
        onClose();
      },
      keywords: ['json', 'format', 'minify', 'validate']
    },
    {
      id: 'tool-base64',
      title: 'Base64 Encoder / Decoder',
      subtitle: 'Bidirectional UTF-8 safe Base64 converter',
      category: 'Dev Toolbox',
      icon: Binary,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('base64');
        onClose();
      },
      keywords: ['base64', 'encode', 'decode', 'binary']
    },
    {
      id: 'tool-url',
      title: 'URL Encoder / Decoder',
      subtitle: 'Safe URI component encoder & decoder',
      category: 'Dev Toolbox',
      icon: Link2,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('url');
        onClose();
      },
      keywords: ['url', 'uri', 'encode', 'decode', 'params']
    },
    {
      id: 'tool-hash',
      title: 'Cryptographic Hashes',
      subtitle: 'Generate SHA-256, SHA-512 & SHA-1 hashes locally',
      category: 'Dev Toolbox',
      icon: KeyRound,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('hash');
        onClose();
      },
      keywords: ['hash', 'sha256', 'sha512', 'sha1', 'crypto']
    },
    {
      id: 'tool-jwt',
      title: 'JWT Token Inspector',
      subtitle: 'Decode and inspect JWT headers, payload & expiration',
      category: 'Dev Toolbox',
      icon: ShieldCheck,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('jwt');
        onClose();
      },
      keywords: ['jwt', 'token', 'decode', 'auth', 'bearer']
    },
    {
      id: 'tool-case',
      title: 'Quick Case Converter',
      subtitle: 'CamelCase, kebab-case, snake_case & title case',
      category: 'Dev Toolbox',
      icon: Type,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('case');
        onClose();
      },
      keywords: ['case', 'camel', 'kebab', 'snake', 'pascal']
    },
    {
      id: 'tool-scratchpad',
      title: 'Offline Scratchpad',
      subtitle: 'Auto-saved local note repository',
      category: 'Dev Toolbox',
      icon: FileEdit,
      action: () => {
        onNavigateTab('toolbox');
        onNavigateToolbox?.('scratchpad');
        onClose();
      },
      keywords: ['notes', 'scratchpad', 'memo', 'save', 'buffer']
    },

    // Actions
    {
      id: 'action-theme',
      title: currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: currentTheme === 'dark' ? 'Industrial White interface' : 'Carbon Slate interface',
      category: 'Actions',
      icon: currentTheme === 'dark' ? Sun : Moon,
      action: () => { onToggleTheme(); onClose(); },
      keywords: ['theme', 'dark', 'light', 'mode', 'color']
    }
  ];

  const filteredItems = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = item.title.toLowerCase().includes(q);
    const subMatch = item.subtitle?.toLowerCase().includes(q);
    const kwMatch = item.keywords?.some(k => k.toLowerCase().includes(q));
    const catMatch = item.category.toLowerCase().includes(q);
    return titleMatch || subMatch || kwMatch || catMatch;
  });

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      scrollSelectedIntoView((selectedIndex - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const element = list.children[index] as HTMLElement;
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 rounded-2xl shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ff6b00] overflow-hidden flex flex-col max-h-[75vh]"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDownList}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
          <Search size={18} className="text-[#ff6b00] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search tools (e.g. Compare, Regex, JWT, Dark)..."
            className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-mono text-xs sm:text-sm font-semibold"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-400">
              ESC
            </kbd>
          </div>
        </div>

        {/* Command list */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/40"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 font-mono text-xs">
              No matching commands or tools found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-100 ${
                    isSelected 
                      ? 'bg-[#ff6b00] text-white shadow-sm' 
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border ${
                      isSelected 
                        ? 'bg-black/20 border-black/30 text-white' 
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-[#ff6b00]'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-bold truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className={`text-[11px] truncate ${
                          isSelected ? 'text-orange-100' : 'text-zinc-400 dark:text-zinc-500'
                        }`}>
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                      isSelected 
                        ? 'border-white/30 bg-white/20 text-white' 
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {item.category}
                    </span>
                    {isSelected && (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 bg-black/20 rounded">
                        ↵
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 px-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↑</kbd> <kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↓</kbd> to navigate</span>
            <span><kbd className="px-1 bg-zinc-200 dark:bg-zinc-800 rounded">↵</kbd> to select</span>
          </div>
          <span className="text-[#ff6b00] font-bold">Align Precision Navigator</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
