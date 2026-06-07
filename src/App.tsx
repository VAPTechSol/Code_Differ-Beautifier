import { useState } from 'react';
import { 
  GitCompare, 
  Database, 
  Sparkles, 
  ExternalLink
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import './App.css';
import { VERSION } from './version';

type Tab = 'diff' | 'sql-compare' | 'beautifier';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');

  const navigationItems = [
    { id: 'diff' as Tab, label: 'Code Compare', icon: GitCompare, description: 'Diff side-by-side or inline code changes' },
    { id: 'sql-compare' as Tab, label: 'SQL Compare', icon: Database, description: 'Compare SQL queries with formatting options' },
    { id: 'beautifier' as Tab, label: 'Beautifier', icon: Sparkles, description: 'Format and beautify JS, TS, HTML, CSS, JSON & SQL' }
  ];

  return (
    <div className="app-container relative font-sans flex flex-col min-h-screen text-zinc-900 bg-[#fcfcfd] overflow-hidden">
      
      {/* Ambient Animated Glowing Backdrop Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Indigo Blob */}
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-200/20 blur-[130px] animate-float-slow"></div>
        {/* Soft Violet/Pink Blob */}
        <div className="absolute -bottom-[15%] -right-[10%] w-[700px] h-[700px] rounded-full bg-violet-200/15 blur-[150px] animate-float-slower"></div>
        {/* Soft Emerald/Amber Blob */}
        <div className="absolute top-[30%] right-[15%] w-[450px] h-[450px] rounded-full bg-emerald-100/10 blur-[120px] animate-float-medium"></div>
      </div>

      {/* Grid Dot Overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none z-0 opacity-70"></div>

      {/* Top Premium Navbar */}
      <header className="header relative z-10 sticky top-0 bg-white/85 border-b border-zinc-200/80 px-6 md:px-10 flex items-center justify-between backdrop-blur-md">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0 group cursor-pointer">
          <div className="relative p-2 bg-zinc-950 rounded-xl text-white shadow-md flex items-center justify-center overflow-hidden border border-zinc-800 transition-transform duration-300 group-hover:scale-105">
            {/* Pulsing inner gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            <svg className="relative z-10 w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h12" className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <path d="M4 14h12" className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              <path d="M12 6L8 10L12 14" className="group-hover:scale-105 transition-transform duration-200" />
              <path d="M20 4v16" className="animate-pulse" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-zinc-950 block leading-none bg-gradient-to-r from-zinc-950 to-zinc-700 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-violet-600 transition-all duration-300">
              Kollate
            </span>
            <span className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase mt-1.5 block">
              Premium Dev Suite
            </span>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center bg-zinc-100/80 p-1 rounded-xl border border-zinc-200/60 backdrop-blur-sm">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'active font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-zinc-950' : 'text-zinc-400'} />
                <span className="text-xs font-semibold leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator & Links */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Status: Ready</span>
          </div>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-zinc-900 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Docs</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </header>

      {/* Main Workspace Display Area */}
      <main className="content-pane relative z-10 flex-1 overflow-hidden px-6 py-4 md:px-10 md:py-5 min-h-0 flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {activeTab === 'diff' && <CodeDiff />}
          {activeTab === 'sql-compare' && <SqlCompare />}
          {activeTab === 'beautifier' && <Beautifier />}
        </div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="relative z-10 bg-white/85 border-t border-zinc-200/80 py-3.5 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 shrink-0 backdrop-blur-md">
        <div>
          © {new Date().getFullYear()} Kollate Studio. All rights reserved.
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
