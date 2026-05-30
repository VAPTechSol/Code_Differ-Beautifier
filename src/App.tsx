import { useState } from 'react';
import { 
  FileCode, 
  Database, 
  Sparkles, 
  Code2, 
  ExternalLink
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import './App.css';

type Tab = 'diff' | 'sql-compare' | 'beautifier';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');

  const navigationItems = [
    { id: 'diff' as Tab, label: 'Code Compare', icon: FileCode, description: 'Diff side-by-side or inline code changes' },
    { id: 'sql-compare' as Tab, label: 'SQL Compare', icon: Database, description: 'Compare SQL queries with formatting options' },
    { id: 'beautifier' as Tab, label: 'Beautifier', icon: Sparkles, description: 'Format and beautify JS, TS, HTML, CSS, JSON & SQL' }
  ];

  return (
    <div className="app-container font-sans flex flex-col min-h-screen text-zinc-900 bg-zinc-50">
      
      {/* Top Premium Navbar */}
      <header className="header sticky top-0 z-40 bg-white border-b border-zinc-200/80 px-6 md:px-10 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-1.5 bg-black rounded-lg text-white shadow-sm flex items-center justify-center">
            <Code2 size={18} />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-zinc-950 block leading-none">Klarity</span>
            <span className="text-[9px] text-zinc-400 font-bold tracking-wider uppercase mt-1 block">Premium Dev Suite</span>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'active bg-white text-zinc-950 font-semibold shadow-sm border border-zinc-200/40'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50/50'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-black' : 'text-zinc-400'} />
                <span className="text-xs font-semibold leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status Indicator & Links */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
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
      <main className="content-pane flex-grow overflow-y-auto px-6 py-6 md:px-10 md:py-8">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6">
          {activeTab === 'diff' && <CodeDiff />}
          {activeTab === 'sql-compare' && <SqlCompare />}
          {activeTab === 'beautifier' && <Beautifier />}
        </div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="bg-white border-t border-zinc-200/80 py-4 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400">
        <div>
          © {new Date().getFullYear()} Klarity Devtools. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
          <span>Version 1.1.0</span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-400">Premium minimalist utility engine. Built for performance.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
