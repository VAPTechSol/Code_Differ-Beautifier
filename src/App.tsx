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
  ChevronRight
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import DevToolbox from './components/DevToolbox';
import DestressZone from './components/DestressZone';
import { useTheme } from './context/ThemeContext';
import './App.css';
import { VERSION } from './version';

type Tab = 'diff' | 'sql-compare' | 'beautifier' | 'toolbox' | 'destress';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const funStates = [
    "Precision Engine Active",
    "Brackets Aligned",
    "Polishing AST Nodes",
    "Diff Matrix Synced",
    "Compiling Zero Bugs",
    "Caffeine Infused",
    "Quantum Beautified"
  ];
  const [funStatus, setFunStatus] = useState(funStates[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFunStatus(prev => {
        const idx = funStates.indexOf(prev);
        return funStates[(idx + 1) % funStates.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    { id: 'diff' as Tab, label: 'Code Compare', icon: GitCompare, description: 'Diff side-by-side or inline code changes' },
    { id: 'sql-compare' as Tab, label: 'SQL Compare', icon: Database, description: 'Compare SQL queries with formatting options' },
    { id: 'beautifier' as Tab, label: 'Beautifier', icon: Sparkles, description: 'Format and beautify JS, TS, HTML, CSS, JSON & SQL' },
    { id: 'toolbox' as Tab, label: 'Dev Toolbox 🧰', icon: Wrench, description: 'JSON Studio, Base64, URL, Hashes, JWT & Scratchpad' },
    { id: 'destress' as Tab, label: 'Destress Zone 🎈', icon: Smile, description: 'Play stress-relieving mini-games and support the team' }
  ];

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* Premium Collapsible Left Sidebar */}
      <aside className={`relative z-20 h-full bg-zinc-50 dark:bg-zinc-900 border-r-2 border-zinc-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${sidebarCollapsed ? 'w-18' : 'w-64'}`}>
        
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 h-16 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3 cursor-pointer group">
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

        {/* Navigation stack */}
        <nav className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto min-h-0 mt-3">
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
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 relative">
        
        {/* Blueprint Dot Overlay */}
        <div className="absolute inset-0 dot-pattern pointer-events-none z-0 opacity-85"></div>

        {/* Main Workspace Display Area */}
        <main className="content-pane relative z-10 flex-1 overflow-hidden px-6 py-4 md:px-10 md:py-5 min-h-0 flex flex-col">
          <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0">
            <div className={activeTab === 'diff' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <CodeDiff />
            </div>
            <div className={activeTab === 'sql-compare' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <SqlCompare />
            </div>
            <div className={activeTab === 'beautifier' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <Beautifier />
            </div>
            <div className={activeTab === 'toolbox' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <DevToolbox />
            </div>
            <div className={activeTab === 'destress' ? 'flex flex-col flex-1 min-h-0' : 'hidden'}>
              <DestressZone />
            </div>
          </div>
        </main>

        {/* Modern Compact Footer */}
        <footer className="relative z-10 bg-white/90 dark:bg-zinc-900/90 border-t-2 border-zinc-200/80 dark:border-zinc-800 py-3.5 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 shrink-0 backdrop-blur-md">
          <div>
            © {new Date().getFullYear()} Align Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
            <span>Version {VERSION}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>Made with ❤️ by <a href="mailto:info@vaptechsol.com" className="underline hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">VAPTechSol</a></span>
          </div>
        </footer>

      </div>

    </div>
  );
}

export default App;
