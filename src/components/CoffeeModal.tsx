import { useState } from 'react';
import { 
  Coffee, 
  Smile, 
  RefreshCw, 
  Sparkles, 
  Flame, 
  Heart,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const DEV_JOKES = [
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
  "['hip', 'hip'] (Array(2) - Hip Hip Array!)",
  "Why do programmers wear glasses? Because they can't C#.",
  "An optimist says: 'The glass is half-full.' A pessimist says: 'The glass is half-empty.' A programmer says: 'The glass is twice as large as it needs to be.'",
  "My code doesn't work, I have no idea why. My code works, I have no idea why.",
  "A user interface is like a joke. If you have to explain it, it's not that good.",
  "Why did the database administrator leave his wife? She had one-to-many relationships."
];

export default function CoffeeModal({ isOpen, onClose, onOpen }: CoffeeModalProps) {
  const [activeTab, setActiveTab] = useState<'coffee' | 'destress'>('destress'); // default to destress zone!
  
  // Coffee states
  const [caffeineLevel, setCaffeineLevel] = useState(78);
  const [thanksMsg, setThanksMsg] = useState('');
  
  // Destress: Bubble wrap state
  const [bubbles, setBubbles] = useState<boolean[]>(Array(16).fill(true));
  const [popCount, setPopCount] = useState(0);
  
  // Destress: Incinerator state
  const [spaghettiText, setSpaghettiText] = useState('');
  const [isIncinerating, setIsIncinerating] = useState(false);
  const [incinerateSuccess, setIncinerateSuccess] = useState(false);
  
  // Destress: Joke state
  const [jokeIdx, setJokeIdx] = useState(0);

  const handleBuyCoffee = (qty: number, cost: number) => {
    setCaffeineLevel(prev => Math.min(prev + qty * 4, 100));
    setThanksMsg(`Added ${qty} cup(s) virtual caffeine! Thanks for the $${cost}! ☕✨`);
    setTimeout(() => setThanksMsg(''), 4500);
  };

  const handlePopBubble = (index: number) => {
    if (bubbles[index]) {
      const next = [...bubbles];
      next[index] = false;
      setBubbles(next);
      setPopCount(prev => prev + 1);
    }
  };

  const resetBubbleWrap = () => {
    setBubbles(Array(16).fill(true));
  };

  const handleIncinerate = () => {
    if (!spaghettiText.trim()) return;
    setIsIncinerating(true);
    
    // Animate the incineration of text
    setTimeout(() => {
      setIsIncinerating(false);
      setSpaghettiText('');
      setIncinerateSuccess(true);
      setTimeout(() => setIncinerateSuccess(false), 3000);
    }, 1200);
  };

  const nextJoke = () => {
    let nextIdx = Math.floor(Math.random() * DEV_JOKES.length);
    if (nextIdx === jokeIdx) {
      nextIdx = (nextIdx + 1) % DEV_JOKES.length;
    }
    setJokeIdx(nextIdx);
  };

  return (
    <>
      {/* Sticky Tab Handle (only visible when drawer is CLOSED) */}
      {!isOpen && (
        <button 
          onClick={onOpen}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#ff6b00] hover:bg-orange-600 text-black border-2 border-r-0 border-black rounded-l-xl p-2 shadow-[-3px_3px_0px_0px_#000000] flex flex-col items-center gap-1.5 btn-spring z-40 transition-all cursor-pointer"
        >
          <Coffee size={14} className="animate-bounce" />
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest [writing-mode:vertical-lr] select-none py-1">
            Destress & Coffee
          </span>
          <ChevronLeft size={10} className="text-black" />
        </button>
      )}

      {/* Side drawer Container */}
      <div 
        className={`fixed top-[58px] bottom-[41px] right-0 z-40 w-[300px] bg-white border-l-2 border-black shadow-[-4px_0px_0px_0px_#000000] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Top Header */}
        <div className="bg-zinc-950 text-white p-3 px-4 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#ff6b00] rounded-lg text-black border border-black flex items-center justify-center">
              <Coffee size={13} />
            </div>
            <span className="font-extrabold text-[11px] uppercase tracking-wider font-mono">Destress Station</span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Collapse drawer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-zinc-200 bg-zinc-50 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('destress')}
            className={`flex-1 py-1.5 rounded-md font-mono text-[10px] font-bold transition-all btn-spring flex items-center justify-center gap-1 ${
              activeTab === 'destress'
                ? 'bg-zinc-950 text-white border border-black shadow-[1px_1px_0px_0px_#000000]'
                : 'text-zinc-600 hover:text-zinc-950 border border-transparent'
            }`}
          >
            <Smile size={12} />
            Destress Zone
          </button>

          <button
            onClick={() => setActiveTab('coffee')}
            className={`flex-1 py-1.5 rounded-md font-mono text-[10px] font-bold transition-all btn-spring flex items-center justify-center gap-1 ${
              activeTab === 'coffee'
                ? 'bg-zinc-950 text-white border border-black shadow-[1px_1px_0px_0px_#000000]'
                : 'text-zinc-600 hover:text-zinc-950 border border-transparent'
            }`}
          >
            <Coffee size={12} />
            Buy Coffee
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0 bg-white relative dot-pattern">
          
          {activeTab === 'coffee' && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h3 className="font-extrabold text-xs text-zinc-950 font-mono">Fuel the Developers</h3>
                <p className="text-[10px] text-zinc-400 font-mono mt-1 leading-normal">
                  Enjoying Kollate? Virtual caffeine keeps our servers running and bugs squashed.
                </p>
              </div>

              {/* Coffee Level Progress */}
              <div className="card p-3 bg-zinc-50 border-2 border-zinc-200 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-600">
                  <span>Caffeine Tank:</span>
                  <span className="text-[#ff6b00]">{caffeineLevel}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden border border-zinc-300">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-[#ff6b00] h-full transition-all duration-500" 
                    style={{ width: `${caffeineLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Coffee Purchase Grid */}
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => handleBuyCoffee(1, 5)}
                  className="card p-2 bg-white hover:border-[#ff6b00] border-2 border-zinc-200 rounded-xl flex items-center justify-between px-3 btn-spring"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">☕</span>
                    <div className="text-left">
                      <span className="font-extrabold text-[11px] text-zinc-900 font-mono block">1 Coffee</span>
                      <span className="text-[9px] text-[#ff6b00] font-mono font-bold">1h Debugging</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold bg-zinc-100 px-2 py-0.5 rounded border">$5</span>
                </button>
                
                <button 
                  onClick={() => handleBuyCoffee(3, 15)}
                  className="card p-2 bg-white hover:border-[#ff6b00] border-2 border-zinc-200 rounded-xl flex items-center justify-between px-3 btn-spring"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">☕☕</span>
                    <div className="text-left">
                      <span className="font-extrabold text-[11px] text-zinc-900 font-mono block">3 Coffees</span>
                      <span className="text-[9px] text-[#ff6b00] font-mono font-bold">Fix Bugs</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold bg-zinc-100 px-2 py-0.5 rounded border">$15</span>
                </button>

                <button 
                  onClick={() => handleBuyCoffee(5, 25)}
                  className="card p-2 bg-white hover:border-[#ff6b00] border-2 border-zinc-200 rounded-xl flex items-center justify-between px-3 btn-spring"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">☕☕☕</span>
                    <div className="text-left">
                      <span className="font-extrabold text-[11px] text-zinc-900 font-mono block">5 Coffees</span>
                      <span className="text-[9px] text-[#ff6b00] font-mono font-bold">Ship Feature</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold bg-zinc-100 px-2 py-0.5 rounded border">$25</span>
                </button>
              </div>

              {/* Thanks Banner */}
              {thanksMsg && (
                <div className="p-2.5 bg-green-50 text-green-700 text-[10px] font-mono font-bold border border-green-300 rounded-lg text-center animate-success-pop flex items-center justify-center gap-1.5 leading-normal">
                  <Sparkles size={11} className="text-green-600 shrink-0" />
                  <span>{thanksMsg}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'destress' && (
            <div className="flex flex-col gap-4">
              
              {/* Bubble Wrap Widget */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Pop Bubble Wrap:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-400">Pops: <strong className="text-zinc-900">{popCount}</strong></span>
                    <button 
                      onClick={resetBubbleWrap} 
                      className="p-0.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-950 transition-colors"
                      title="Reload wrap"
                    >
                      <RefreshCw size={10} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 bg-zinc-100 p-2 rounded-xl border border-zinc-200 w-full max-w-[200px] mx-auto">
                  {bubbles.map((active, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePopBubble(idx)}
                      className={`h-7.5 w-7.5 rounded-full font-bold text-[10px] flex items-center justify-center transition-all ${
                        active 
                          ? 'bg-[#ffffff] text-zinc-400 hover:bg-orange-50 border-2 border-zinc-200 hover:border-[#ff6b00] hover:scale-105 shadow-sm active:scale-95 cursor-pointer' 
                          : 'bg-zinc-200 text-zinc-400 border border-zinc-300/40 pointer-events-none scale-90'
                      }`}
                    >
                      {active ? '•' : 'x'}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-zinc-200" />

              {/* Spaghetti Incinerator */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Spaghetti Incinerator:</span>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={spaghettiText}
                    onChange={(e) => setSpaghettiText(e.target.value)}
                    placeholder="Paste bad queries or legacy code here..."
                    className="w-full text-[11px] font-mono p-2 pr-8 border-2 border-zinc-200 rounded-lg focus:border-zinc-950 outline-none resize-none"
                    disabled={isIncinerating}
                  />
                  {spaghettiText && (
                    <button
                      onClick={handleIncinerate}
                      disabled={isIncinerating}
                      className="absolute bottom-2.5 right-1.5 p-1 bg-[#ff6b00] text-black border border-black rounded hover:bg-orange-600 transition-colors btn-spring flex items-center justify-center cursor-pointer"
                      title="Burn it!"
                    >
                      <Flame size={12} className={isIncinerating ? "animate-pulse" : ""} />
                    </button>
                  )}
                </div>
                {incinerateSuccess && (
                  <span className="text-[9px] text-green-600 font-bold font-mono text-center animate-success-pop">
                    🔥 Code vaporized. Feel better?
                  </span>
                )}
              </div>

              <hr className="border-zinc-200" />

              {/* Dev Joke Generator */}
              <div className="card p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Developer Chuckle:</span>
                  <button 
                    onClick={nextJoke} 
                    className="text-[9px] font-mono text-[#ff6b00] hover:underline font-bold"
                  >
                    Next Joke
                  </button>
                </div>
                <p className="text-[11px] font-mono font-semibold text-zinc-800 italic leading-relaxed">
                  "{DEV_JOKES[jokeIdx]}"
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-center gap-1 text-[9px] text-zinc-400 font-mono shrink-0">
          <span>Made with</span>
          <Heart size={9} className="text-[#ff6b00] fill-[#ff6b00]" />
          <span>by VAPTechSol team</span>
        </div>

      </div>
    </>
  );
}
