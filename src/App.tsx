import { useState, useEffect } from 'react';
import { 
  GitCompare, 
  Database, 
  Sparkles, 
  Coffee,
  Smile
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import DestressZone from './components/DestressZone';
import './App.css';
import { VERSION } from './version';

type Tab = 'diff' | 'sql-compare' | 'beautifier' | 'destress';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');

  const funStates = [
    "Ready to Rumble",
    "Ingesting Caffeine",
    "Polishing Pixels",
    "Analyzing Chakras",
    "Compiling micro-bugs",
    "Consulting StackOverflow",
    "Reticulating Splines",
    "Doing Black Magic",
    "Wrangling brackets"
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
    { id: 'destress' as Tab, label: 'Destress Zone 🎈', icon: Smile, description: 'Play stress-relieving mini-games and support the team' }
  ];

  return (
    <div className="app-container relative font-sans flex flex-col min-h-screen text-zinc-900 bg-[#ffffff] overflow-hidden">
      
      {/* Blueprint Dot Overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none z-0 opacity-85"></div>

      {/* Top Premium Navbar */}
      <header className="header relative z-10 sticky top-0 bg-white/90 border-b-2 border-zinc-200/80 px-6 md:px-10 flex items-center justify-between backdrop-blur-md">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
          <div className="relative p-2 bg-zinc-950 rounded-xl text-white shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center overflow-hidden border-2 border-black transition-transform duration-300 group-hover:scale-105">
            {/* Hover Orange Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Winking brackets SVG */}
            <svg 
              className="relative z-10 w-5.5 h-5.5 text-white group-hover:animate-bounce-wink" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Left Bracket */}
              <path d="M8 3H5a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h3" />
              {/* Right Bracket */}
              <path d="M16 3h3a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-3" />
              {/* Eye Left */}
              <circle cx="9.5" cy="11.5" r="1.2" fill="currentColor" />
              {/* Eye Right (Winks on Hover) */}
              <circle cx="14.5" cy="11.5" r="1.2" fill="currentColor" className="group-hover:hidden" />
              <path d="M13.5 12.5a1.5 1.5 0 0 1 2-1" stroke="currentColor" strokeWidth="2" className="hidden group-hover:block" />
              {/* Smile */}
              <path d="M11 14.5a1.5 1.5 0 0 0 2 0" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-zinc-950 block leading-none transition-colors duration-300 group-hover:text-[#ff6b00]">
              Kollidr
            </span>
            <span className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mt-1.5 block">
              Premium Dev Suite
            </span>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center bg-zinc-100/60 p-1 rounded-xl border-2 border-zinc-200 backdrop-blur-sm">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 btn-spring ${
                  isActive
                    ? 'bg-[#ff6b00] text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000]'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/40 border-2 border-transparent'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-zinc-400'} />
                <span className="text-xs font-bold leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator & Links */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-2.5 text-[11px] font-bold tracking-wider text-zinc-700 bg-[#fafafa] border-2 border-zinc-200 px-4 py-1.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,0.05)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6b00]"></span>
            </span>
            <span className="font-mono text-zinc-400">Status:</span>
            <span className="font-mono text-[#ff6b00]">{funStatus}</span>
          </div>
          
          <button 
            onClick={() => setActiveTab('destress')}
            className={`text-xs font-bold font-mono border-2 border-dashed px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all btn-spring ${activeTab === 'destress' ? 'border-[#ff6b00] bg-[#ff6b00] text-white shadow-[2px_2px_0px_0px_#000000]' : 'border-zinc-300 hover:border-black text-zinc-600 hover:text-zinc-950'}`}
          >
            <Coffee size={13} className={activeTab === 'destress' ? 'text-white' : 'text-[#ff6b00]'} />
            <span>Coffee & Destress</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Display Area */}
      <main className="content-pane relative z-10 flex-1 overflow-hidden px-6 py-4 md:px-10 md:py-5 min-h-0 flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {activeTab === 'diff' && <CodeDiff />}
          {activeTab === 'sql-compare' && <SqlCompare />}
          {activeTab === 'beautifier' && <Beautifier />}
          {activeTab === 'destress' && <DestressZone />}
        </div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="relative z-10 bg-white/90 border-t-2 border-zinc-200/80 py-3.5 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 shrink-0 backdrop-blur-md">
        <div>
          © {new Date().getFullYear()} Kollidr Studio. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
          <span>Version {VERSION}</span>
          <span className="text-zinc-300">|</span>
          <span>Made with ❤️ by <a href="mailto:info@vaptechsol.com" className="underline hover:text-zinc-800 transition-colors">VAPTechSol</a></span>
        </div>
      </footer>
    </div>
  );
}

export default App;
