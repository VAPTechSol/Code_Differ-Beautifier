import { useState } from 'react';
import { 
  FileCode, 
  Database, 
  Sparkles, 
  Code2, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import CodeDiff from './components/CodeDiff';
import SqlCompare from './components/SqlCompare';
import Beautifier from './components/Beautifier';
import './App.css';

type Tab = 'diff' | 'sql-compare' | 'beautifier';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diff');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'diff' as Tab, label: 'Code Compare', icon: FileCode, description: 'Diff side-by-side or inline code changes' },
    { id: 'sql-compare' as Tab, label: 'SQL Compare', icon: Database, description: 'Compare SQL queries with formatting options' },
    { id: 'beautifier' as Tab, label: 'Beautifier', icon: Sparkles, description: 'Format and beautify JS, TS, HTML, CSS, JSON & SQL' }
  ];

  const activeItem = navigationItems.find(item => item.id === activeTab);

  return (
    <div className="app-container font-sans flex flex-col md:flex-row min-h-screen text-zinc-900 bg-zinc-50">
      
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-black rounded-lg text-white">
            <Code2 size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">Klarity</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 hover:bg-zinc-100 rounded-md transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] bg-white border-b border-zinc-200 z-30 shadow-lg animate-fade-in">
          <nav className="p-4 flex flex-col gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3.5 p-3 rounded-lg text-left transition-all ${
                    activeTab === item.id
                      ? 'active text-white font-medium shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <Icon size={18} />
                  <div>
                    <div className="font-semibold text-xs leading-none">{item.label}</div>
                  </div>
                </button>
              );
            })}
            <div className="border-t border-zinc-100 my-2 pt-2 text-center text-[10px] text-zinc-400">
              © {new Date().getFullYear()} Klarity Devtools
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex sidebar border-r border-zinc-200 sticky top-0 h-screen z-10 shrink-0">
        <div className="flex flex-col gap-8">
          {/* Logo / Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="p-1.5 bg-black rounded-lg text-white shadow-sm">
              <Code2 size={20} />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-zinc-950">Klarity</span>
              <span className="block text-[10px] text-zinc-400 font-bold tracking-wider uppercase mt-0.5">Premium Dev Suite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'active text-white font-semibold'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-400'} />
                  <div>
                    <span className="block text-xs font-semibold leading-none">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand Info */}
        <div className="flex flex-col gap-4 border-t border-zinc-100 pt-6 px-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Version 1.1.0</span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-zinc-900 flex items-center gap-0.5"
            >
              Docs <ExternalLink size={10} />
            </a>
          </div>
          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
            Beautiful utilities for developer productivity. Zero-dependency formatters.
          </p>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content flex-1 flex flex-col min-w-0">
        
        {/* Workspace Page Header */}
        <div className="hidden md:flex header h-16 border-b border-zinc-200 bg-white px-8 items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-bold text-zinc-900 leading-none">
              {activeItem?.label}
            </h1>
            <span className="text-[11px] text-zinc-400 font-medium block mt-1">
              {activeItem?.description}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Status: Ready</span>
          </div>
        </div>

        {/* Workspace Display Area */}
        <div className="content-pane flex-grow overflow-y-auto px-4 py-6 md:p-8">
          {activeTab === 'diff' && <CodeDiff />}
          {activeTab === 'sql-compare' && <SqlCompare />}
          {activeTab === 'beautifier' && <Beautifier />}
        </div>
      </main>
    </div>
  );
}

export default App;
