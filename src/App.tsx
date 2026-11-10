import { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Database, 
  Sparkles, 
  Wrench,
  Smile,
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Search,
  Command,
  Lightbulb,
  Menu,
  X,
  Download,
  MoreHorizontal
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import MarkdownStudio from './components/MarkdownStudio';
import DevToolbox, { type ToolCategory } from './components/DevToolbox';
import DestressZone from './components/DestressZone';
import FeatureRequest from './components/FeatureRequest';
import CommandPalette from './components/CommandPalette';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useTheme } from './context/ThemeContext';
import './App.css';
import { VERSION } from './version';

type Tab = 'diff' | 'sql-compare' | 'beautifier' | 'markdown' | 'toolbox' | 'destress' | 'feature-request';

const FUN_STATES = [
  "Precision Engine Active",
  "Brackets Aligned",
  "Polishing AST Nodes",
  "Diff Matrix Synced",
  "Compiling Zero Bugs",
  "Caffeine Infused",
  "Quantum Beautified"
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [toolboxInitialTool, setToolboxInitialTool] = useState<ToolCategory>('json');
  const { theme, toggleTheme } = useTheme();
  const [funStatus, setFunStatus] = useState(FUN_STATES[0]);
  const { isInstallable, canPromptDirectly, isInstalled, isIOS, installApp } = usePWAInstall();

  useEffect(() => {
    const interval = setInterval(() => {
      setFunStatus(prev => {
        const idx = FUN_STATES.indexOf(prev);
        return FUN_STATES[(idx + 1) % FUN_STATES.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const navigationItems = [
    { id: 'diff' as Tab, label: 'Code Compare', icon: GitCompare, description: 'Diff side-by-side or inline code changes' },
    { id: 'sql-compare' as Tab, label: 'SQL Compare', icon: Database, description: 'Compare SQL queries with formatting options' },
    { id: 'beautifier' as Tab, label: 'Beautifier', icon: Sparkles, description: 'Format and beautify JS, TS, HTML, CSS, JSON & SQL' },
    { id: 'markdown' as Tab, label: 'Markdown Studio 📝', icon: BookOpen, description: 'Live dual-pane GitHub markdown authoring & HTML export' },
    { id: 'toolbox' as Tab, label: 'Dev Toolbox 🧰', icon: Wrench, description: 'Gzip Encrypt, Regex Lab, Text Tools, JSON, Base64 & JWT' },
    { id: 'destress' as Tab, label: 'Destress Zone 🎈', icon: Smile, description: 'Play stress-relieving mini-games and support the team' },
    { id: 'feature-request' as Tab, label: 'Feature Request 💡', icon: Lightbulb, description: 'Request new features or submit suggestions to info@vaptechsol.com' }
  ];

  const handleNavigateToolbox = (toolId: string) => {
    setToolboxInitialTool(toolId as ToolCategory);
  };

  const handleTabSelect = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as Tab)}
        onNavigateToolbox={handleNavigateToolbox}
        onToggleTheme={toggleTheme}
        currentTheme={theme}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={installApp}
        canPromptDirectly={canPromptDirectly}
        isIOS={isIOS}
      />

      {/* Mobile Top Header (Visible only on < md screens) */}
      <header className="md:hidden pt-safe flex items-center justify-between px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-b-2 border-zinc-200 dark:border-zinc-800 shrink-0 z-30 select-none">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleTabSelect('diff')}
        >
          <div className="relative p-1.5 bg-zinc-950 dark:bg-zinc-800 rounded-lg text-white shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ff6b00] flex items-center justify-center border-2 border-black dark:border-zinc-700">
            <svg 
              className="w-4.5 h-4.5 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="2" x2="12" y2="22" stroke="#ff6b00" strokeWidth="2" strokeDasharray="2 2" />
              <line x1="4" y1="12" x2="20" y2="12" stroke="#ff6b00" strokeWidth="2.5" />
              <path d="M8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2.5" />
              <path d="M16 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="2" fill="#ff6b00" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-sm tracking-tight text-zinc-950 dark:text-white leading-none">
              Align
            </span>
            <span className="text-[9px] font-extrabold text-[#ff6b00] font-mono px-1 py-0.2 rounded bg-orange-500/10 border border-orange-500/20 leading-none">
              Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* PWA Install Button in Header */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="btn-primary py-1 px-2.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs animate-pulse"
              title="Install Align Studio App"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Search Tools (Cmd+K)"
          >
            <Search size={16} />
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-[#ff6b00]" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            title="Open Menu"
            aria-label="Toggle navigation drawer"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Slide-Over Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside className={`md:hidden fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-zinc-50 dark:bg-zinc-900 border-l-2 border-zinc-200 dark:border-zinc-800 z-50 flex flex-col justify-between pt-safe pb-safe shadow-2xl transition-transform duration-300 ease-in-out select-none ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 border-b-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-zinc-950 dark:text-white">
              Navigation Menu
            </span>
            <span className="text-[10px] font-mono text-[#ff6b00] font-bold">
              v{VERSION}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-all btn-spring ${
                  isActive
                    ? 'bg-[#ff6b00] text-white font-bold border-2 border-black dark:border-zinc-800 shadow-[2px_2px_0px_0px_#000000]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[#ff6b00]'} />
                <div>
                  <span className="text-xs font-mono font-bold block">{item.label}</span>
                  <span className={`text-[10px] block line-clamp-1 ${isActive ? 'text-orange-100' : 'text-zinc-400'}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Install PWA Option in Mobile Drawer */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsInstallModalOpen(true);
              }}
              className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-orange-500/10 border-2 border-dashed border-[#ff6b00]/60 text-[#ff6b00] font-bold text-left btn-spring"
            >
              <Download size={18} />
              <div>
                <span className="text-xs font-mono block">Install App (PWA)</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                  Add to home screen for offline access
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Mobile Drawer Footer */}
        <div className="p-3 border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-950/40 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 px-2 py-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b00]"></span>
            </span>
            <span className="truncate">Status: <strong className="text-[#ff6b00]">{funStatus}</strong></span>
          </div>

          <div className="text-[10px] text-zinc-400 font-mono text-center">
            Made with ❤️ by <a href="https://www.vaptechsol.com" target="_blank" rel="noopener noreferrer" className="text-[#ff6b00] underline font-bold">VAPTechSol</a>
          </div>
        </div>
      </aside>

      {/* Premium Collapsible Left Sidebar (Desktop Only >= md) */}
      <aside className={`hidden md:flex relative z-20 h-full bg-zinc-50 dark:bg-zinc-900 border-r-2 border-zinc-200 dark:border-zinc-800 flex-col justify-between transition-all duration-300 ease-in-out select-none ${sidebarCollapsed ? 'w-18' : 'w-64'}`}>
        
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 h-16 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('diff')}>
            {/* Align Studio Precision Logo */}
            <div className="relative p-2 bg-zinc-950 dark:bg-zinc-800 rounded-xl text-white shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ff6b00] flex items-center justify-center overflow-hidden border-2 border-black dark:border-zinc-700 transition-transform duration-300 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg 
                className="relative z-10 w-5.5 h-5.5 text-white" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Central vertical precision guide */}
                <line x1="12" y1="2" x2="12" y2="22" stroke="#ff6b00" strokeWidth="2" strokeDasharray="2 2" />
                {/* Horizontal alignment laser beam */}
                <line x1="4" y1="12" x2="20" y2="12" stroke="#ff6b00" strokeWidth="2.5" />
                {/* Left Alignment Bracket */}
                <path d="M8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" stroke="currentColor" strokeWidth="2.5" />
                {/* Right Alignment Bracket */}
                <path d="M16 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2.5" />
                {/* Precision center target core */}
                <circle cx="12" cy="12" r="2" fill="#ff6b00" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-zinc-950 dark:text-white block leading-none transition-colors duration-300 group-hover:text-[#ff6b00]">
                    Align
                  </span>
                  <span className="text-[10px] font-extrabold text-[#ff6b00] font-mono px-1 py-0.2 rounded bg-orange-500/10 border border-orange-500/20 leading-none">
                    Studio
                  </span>
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold tracking-widest uppercase mt-1 block">
                  Precision Code Suite
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Search / Command Palette Pill */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-[#ff6b00] dark:hover:border-[#ff6b00] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all btn-spring shadow-xs ${
              sidebarCollapsed ? 'justify-center px-0' : 'px-3'
            }`}
            title="Search tools or commands (Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-[#ff6b00]" />
              {!sidebarCollapsed && <span>Search Tools...</span>}
            </div>
            {!sidebarCollapsed && (
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-400">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* Navigation stack */}
        <nav className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-0 mt-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-150 btn-spring group relative ${
                  isActive
                    ? 'bg-[#ff6b00] text-white font-bold border-2 border-black dark:border-zinc-800 shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ff6b00]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 border-2 border-transparent'
                } ${sidebarCollapsed ? 'justify-center px-0' : 'px-3.5'}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-[#ff6b00]'} />
                {!sidebarCollapsed && (
                  <div className="text-left animate-fade-in">
                    <span className="text-xs font-mono font-bold leading-none block">{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Controls Footer */}
        <div className="p-3 border-t-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40">
          
          {/* PWA Install Button in Desktop Sidebar */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-mono font-bold bg-orange-500/10 border-2 border-orange-500/40 text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all btn-spring ${
                sidebarCollapsed ? 'justify-center px-0' : 'px-3'
              }`}
              title="Install Align Studio App (PWA)"
            >
              <Download size={14} />
              {!sidebarCollapsed && <span>Install App</span>}
            </button>
          )}

          {/* Heartbeat Status Indicator */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm truncate animate-fade-in">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b00]"></span>
              </span>
              <span className="text-zinc-400 truncate">Status: <strong className="text-[#ff6b00]">{funStatus}</strong></span>
            </div>
          )}

          {/* Theme & Collapse Controls */}
          <div className={`flex items-center justify-between ${sidebarCollapsed ? 'flex-col gap-3' : 'flex-row'}`}>
            <button 
              onClick={toggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 rounded-lg transition-all btn-spring cursor-pointer"
              title={theme === 'dark' ? "Switch to Light Mode (Industrial White)" : "Switch to Dark Mode (Carbon Slate)"}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-500" /> : <Moon size={15} className="text-[#ff6b00]" />}
            </button>

            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-zinc-500 rounded-lg transition-all btn-spring cursor-pointer"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Workspace Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 relative min-w-0">
        
        {/* Blueprint Dot Overlay */}
        <div className="absolute inset-0 dot-pattern pointer-events-none z-0 opacity-85"></div>

        {/* Main Workspace Display Area */}
        <main className="content-pane relative z-10 flex-1 overflow-y-auto md:overflow-hidden px-2.5 py-2.5 sm:px-4 sm:py-3 md:px-8 md:py-4 min-h-0 flex flex-col touch-scroll">
          <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0">
            <div className={activeTab === 'diff' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <CodeDiff />
            </div>
            <div className={activeTab === 'sql-compare' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <SqlCompare />
            </div>
            <div className={activeTab === 'beautifier' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <Beautifier />
            </div>
            <div className={activeTab === 'markdown' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <MarkdownStudio />
            </div>
            <div className={activeTab === 'toolbox' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <DevToolbox initialTool={toolboxInitialTool} />
            </div>
            <div className={activeTab === 'destress' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <DestressZone />
            </div>
            <div className={activeTab === 'feature-request' ? 'flex flex-col flex-1 min-h-0 animate-tab-switch' : 'hidden'}>
              <FeatureRequest />
            </div>
          </div>
        </main>

        {/* Desktop Modern Compact Footer (Hidden on Mobile) */}
        <footer className="hidden md:flex relative z-10 bg-white/90 dark:bg-zinc-900/90 border-t-2 border-zinc-200/80 dark:border-zinc-800 py-3 px-6 md:px-8 flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3 flex-wrap">
            <span>© {new Date().getFullYear()} Align Studio. All rights reserved.</span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <button
              onClick={() => setActiveTab('feature-request')}
              className="text-[#ff6b00] hover:underline font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Lightbulb size={12} />
              <span>Request Feature / Suggestion</span>
            </button>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-1 hover:text-[#ff6b00] transition-colors"
            >
              <Command size={11} />
              <span>Press <kbd className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-[10px]">Ctrl+K</kbd> anywhere</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium flex-wrap">
            <span>Version {VERSION}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>
              Made with ❤️ by{' '}
              <a 
                href="https://www.vaptechsol.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-zinc-800 dark:hover:text-zinc-200 text-[#ff6b00] font-bold transition-colors"
                title="Visit VAPTechSol"
              >
                VAPTechSol
              </a>
            </span>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar (Visible only on < md screens) */}
        <nav className="md:hidden pb-safe relative z-30 bg-zinc-50 dark:bg-zinc-900 border-t-2 border-zinc-200 dark:border-zinc-800 px-2 py-1 flex items-center justify-around shrink-0 select-none shadow-lg">
          <button
            onClick={() => handleTabSelect('diff')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              activeTab === 'diff' 
                ? 'text-[#ff6b00] font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <GitCompare size={18} />
            <span className="text-[10px] font-mono mt-0.5">Compare</span>
          </button>

          <button
            onClick={() => handleTabSelect('beautifier')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              activeTab === 'beautifier' 
                ? 'text-[#ff6b00] font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles size={18} />
            <span className="text-[10px] font-mono mt-0.5">Beautify</span>
          </button>

          <button
            onClick={() => handleTabSelect('sql-compare')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              activeTab === 'sql-compare' 
                ? 'text-[#ff6b00] font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Database size={18} />
            <span className="text-[10px] font-mono mt-0.5">SQL</span>
          </button>

          <button
            onClick={() => handleTabSelect('toolbox')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              activeTab === 'toolbox' 
                ? 'text-[#ff6b00] font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Wrench size={18} />
            <span className="text-[10px] font-mono mt-0.5">Toolbox</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all ${
              ['markdown', 'destress', 'feature-request'].includes(activeTab) 
                ? 'text-[#ff6b00] font-bold' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="More Tools"
          >
            <MoreHorizontal size={18} />
            <span className="text-[10px] font-mono mt-0.5">More</span>
          </button>
        </nav>

      </div>

    </div>
  );
}

export default App;
