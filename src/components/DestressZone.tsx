import { useState, useEffect } from 'react';
import { 
  Coffee, 
  Smile, 
  Flame, 
  Heart,
  Skull,
  Zap
} from 'lucide-react';

const PANIC_EXCUSES = [
  "It worked on my machine! 🤷‍♂️",
  "That was legacy code, I swear! 📜",
  "Solar flares must have corrupted the database. ☀️📡",
  "The intern pushed directly to main! 👶",
  "I was just following the Jira ticket specifications. 📋",
  "It's not a bug, it's an undocumented feature. 🦄",
  "StackOverflow was down for 5 minutes. 📉",
  "The API documentation lied to me. 📖🤥",
  "I forgot to save the file. 💾🤦‍♂️"
];

const COMBAT_ACTIONS = [
  { text: "Refactored nested loops!", dmg: 18, type: 'good' },
  { text: "Added unit tests!", dmg: 25, type: 'good' },
  { text: "Deleted dead code!", dmg: 15, type: 'good' },
  { text: "Read the docs carefully!", dmg: 30, type: 'good' },
  { text: "Copied code from ChatGPT (It has compilation errors!)", dmg: -10, type: 'bad' },
  { text: "Forgot a semicolon!", dmg: -15, type: 'bad' },
  { text: "Git merge conflict occurred!", dmg: -20, type: 'bad' },
  { text: "StackOverflow copy-paste did not compile!", dmg: -5, type: 'bad' }
];

export default function DestressZone() {
  // Panic Button State
  const [excuse, setExcuse] = useState("Click to generate excuse");
  const [isExcused, setIsExcused] = useState(false);
  const [excuseCount, setExcuseCount] = useState(0);

  // Bubble Wrap State
  const [bubbles, setBubbles] = useState<boolean[]>(Array(64).fill(true));
  const [popCount, setPopCount] = useState(0);
  const [poppingList, setPoppingList] = useState<{ id: string; index: number }[]>([]);

  // Web Audio API pop synthesizer sound
  const playPopSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Start high, sweep down fast
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Spaghetti Incinerator State
  const [incineratedCode, setIncineratedCode] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);

  // Bug Boss Battle State
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp] = useState(100);
  const [battleLogs, setBattleLogs] = useState<string[]>(["A wild Legacy Spaghetti Code appeared!"]);
  const [bossStatus, setBossStatus] = useState<'normal' | 'hit' | 'healed' | 'dead'>('normal');

  // Productivity Clicker Game
  const [loc, setLoc] = useState(0);
  const [cps, setCps] = useState(0); // lines of code per second
  const [upgrades, setUpgrades] = useState([
    { name: "Mechanical Keyboard", cost: 15, cpsBonus: 1, count: 0, icon: "⌨️" },
    { name: "ChatGPT Co-pilot", cost: 80, cpsBonus: 5, count: 0, icon: "🤖" },
    { name: "Noise-Canceling Headphones", cost: 250, cpsBonus: 20, count: 0, icon: "🎧" },
    { name: "Emergency Espresso Drip", cost: 1000, cpsBonus: 100, count: 0, icon: "☕" }
  ]);

  // Support / Buy Coffee State
  const [coffeePurchases, setCoffeePurchases] = useState(0);
  const [boughtCoffeeMsg, setBoughtCoffeeMsg] = useState('');

  // Productivity Tick Effect
  useEffect(() => {
    if (cps > 0) {
      const interval = setInterval(() => {
        setLoc(prev => prev + cps);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cps]);

  // Panic Button Handler
  const triggerPanic = () => {
    setIsExcused(true);
    const randomIdx = Math.floor(Math.random() * PANIC_EXCUSES.length);
    setExcuse(PANIC_EXCUSES[randomIdx]);
    setExcuseCount(prev => prev + 1);
    setTimeout(() => setIsExcused(false), 800);
  };

  // Bubble wrap handler
  const handlePop = (idx: number) => {
    if (bubbles[idx]) {
      const next = [...bubbles];
      next[idx] = false;
      setBubbles(next);
      setPopCount(prev => prev + 1);
      
      playPopSound();

      // Trigger visual burst
      const popId = Math.random().toString(36).substring(2, 9);
      setPoppingList(prev => [...prev, { id: popId, index: idx }]);
      setTimeout(() => {
        setPoppingList(prev => prev.filter(p => p.id !== popId));
      }, 400);
    }
  };

  const resetBubbles = () => {
    setBubbles(Array(64).fill(true));
    setPoppingList([]);
  };

  // Incinerator
  const startIncinerate = () => {
    if (!incineratedCode.trim()) return;
    setIsBurning(true);
    setTimeout(() => {
      setIsBurning(false);
      setIncineratedCode('');
      setBurnComplete(true);
      setTimeout(() => setBurnComplete(false), 2500);
    }, 1500);
  };

  // Bug Battler Action
  const performAttack = () => {
    if (bossHp <= 0) return;

    const action = COMBAT_ACTIONS[Math.floor(Math.random() * COMBAT_ACTIONS.length)];
    const damage = action.dmg;
    
    let newHp = bossHp - damage;
    if (newHp > bossMaxHp) newHp = bossMaxHp;
    if (newHp < 0) newHp = 0;

    setBossHp(newHp);

    let logMsg = "";
    if (damage > 0) {
      logMsg = `💥 ${action.text} Dealt ${damage} damage to Spaghetti Code.`;
      setBossStatus('hit');
      setTimeout(() => setBossStatus('normal'), 400);
    } else {
      logMsg = `⚠️ ${action.text} Healed Spaghetti Code for ${Math.abs(damage)} HP!`;
      setBossStatus('healed');
      setTimeout(() => setBossStatus('normal'), 400);
    }

    if (newHp <= 0) {
      logMsg = "🏆 Congratulations! You compiled Spaghetti Code into a clean codebase! The boss is DEAD!";
      setBossStatus('dead');
    }

    setBattleLogs(prev => [logMsg, ...prev.slice(0, 5)]);
  };

  const resetBoss = () => {
    setBossHp(bossMaxHp);
    setBossStatus('normal');
    setBattleLogs(["Spaghetti Code has respawned, uglier than before!"]);
  };

  // Clicker Action
  const manualClick = () => {
    setLoc(prev => prev + 1);
  };

  const buyUpgrade = (index: number) => {
    const upgrade = upgrades[index];
    if (loc >= upgrade.cost) {
      setLoc(prev => prev - upgrade.cost);
      
      const newUpgrades = [...upgrades];
      newUpgrades[index] = {
        ...upgrade,
        count: upgrade.count + 1,
        cost: Math.round(upgrade.cost * 1.35)
      };
      
      setUpgrades(newUpgrades);
      setCps(prev => prev + upgrade.cpsBonus);
    }
  };

  // Support
  const handleSupportCoffee = (qty: number, amount: number) => {
    setCoffeePurchases(prev => prev + qty);
    setBoughtCoffeeMsg(`Successfully fueled VAPTechSol team with ${qty} cup(s) of coffee ($${amount}). Thank you! ☕✨`);
    setTimeout(() => setBoughtCoffeeMsg(''), 4000);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto pb-10">
      
      {/* Intro Header */}
      <div className="card bg-white p-6 border-2 border-zinc-200 rounded-xl dot-pattern relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex flex-col gap-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <span className="p-1.5 bg-[#ff6b00] rounded-xl text-black border-2 border-black flex items-center justify-center">
              <Smile size={18} />
            </span>
            <h1 className="font-extrabold text-xl font-mono uppercase tracking-wider text-zinc-950">
              Developer Destress & Productivity Zone
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-mono max-w-2xl leading-relaxed">
            Legacy code got you down? Client making last-minute scope changes? Pop some bubbles, release panic excuse formulas, smash spaghetti code, or click to build a virtual coding empire. Work is stressful, take a micro-break!
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold bg-zinc-950 text-white p-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#ff6b00]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span>Mental Health: Stable</span>
        </div>
      </div>

      {/* Main Grid Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. THE PANIC BUTTON */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000] relative">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={13} className="text-[#ff6b00]" />
            <span>Emergency excuse generator</span>
          </div>
          
          <div className="p-6 flex flex-col items-center justify-center gap-5 flex-1 text-center dot-pattern">
            {/* The giant panic button */}
            <button
              onClick={triggerPanic}
              className={`h-28 w-28 rounded-full border-4 border-black font-extrabold text-sm uppercase tracking-widest transition-transform duration-150 btn-spring flex items-center justify-center cursor-pointer ${
                isExcused 
                  ? 'bg-red-700 scale-95 shadow-inner text-zinc-200' 
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-[0px_8px_0px_0px_#991b1b,0px_10px_0px_0px_#000000] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-[0px_2px_0px_0px_#991b1b,0px_4px_0px_0px_#000000]'
              }`}
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
              }}
            >
              <span>Panic!</span>
            </button>

            <div className={`p-4 bg-zinc-50 border-2 border-zinc-200 rounded-lg w-full min-h-[70px] flex items-center justify-center font-mono text-xs font-bold leading-normal ${isExcused ? 'animate-wiggle text-red-600 border-red-300' : 'text-zinc-700'}`}>
              "{excuse}"
            </div>

            <span className="text-[10px] text-zinc-400 font-mono font-bold">
              Times Panicked: {excuseCount}
            </span>
          </div>
        </div>

        {/* 2. BUG BOSS BATTLER */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000]">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Skull size={13} className="text-[#ff6b00]" />
            <span>Legacy Code Bug Battler</span>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1 dot-pattern">
            {/* Boss visual card */}
            <div className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all duration-300 ${
              bossStatus === 'hit' 
                ? 'bg-red-50 border-red-400 animate-wiggle' 
                : bossStatus === 'healed'
                ? 'bg-green-50 border-green-400 scale-105'
                : bossStatus === 'dead'
                ? 'bg-zinc-950 border-black opacity-90'
                : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border-2 border-black ${bossHp <= 0 ? 'bg-zinc-800 text-zinc-400' : 'bg-orange-100 text-[#ff6b00]'}`}>
                  <Skull size={20} className={bossHp > 0 && bossStatus !== 'dead' ? "animate-pulse" : ""} />
                </div>
                <div>
                  <span className={`font-mono text-xs font-bold block ${bossHp <= 0 ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                    {bossHp <= 0 ? 'Clean Codebase 🎉' : 'Legacy Spaghetti Code'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 font-bold">
                    Class: Monster Spaghetti Boss
                  </span>
                </div>
              </div>

              {/* Health display */}
              <div className="text-right flex flex-col gap-1">
                <span className="text-[10px] font-mono font-extrabold text-[#ff6b00]">
                  HP: {bossHp} / {bossMaxHp}
                </span>
                <div className="w-24 bg-zinc-200 h-2 rounded-full overflow-hidden border border-zinc-300">
                  <div 
                    className="bg-[#ff6b00] h-full transition-all duration-300"
                    style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Combat Actions */}
            <div className="flex gap-2">
              {bossHp > 0 ? (
                <button
                  onClick={performAttack}
                  className="btn-primary py-2 flex-1 btn-spring font-mono text-xs font-bold text-center"
                >
                  ⚔️ Refactor & Slap Boss
                </button>
              ) : (
                <button
                  onClick={resetBoss}
                  className="btn-secondary py-2 flex-1 btn-spring font-mono text-xs font-bold text-center"
                >
                  🔄 Respawn Buggy Boss
                </button>
              )}
            </div>

            {/* Combat Log */}
            <div className="flex-1 bg-zinc-900 text-zinc-300 p-3 rounded-lg border border-black font-mono text-[10px] flex flex-col gap-1.5 overflow-y-auto max-h-[110px] leading-relaxed">
              {battleLogs.map((log, idx) => (
                <div key={idx} className={idx === 0 ? 'text-white font-bold' : 'text-zinc-400'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. PRODUCTIVITY CLICKER */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000]">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Coffee size={13} className="text-[#ff6b00]" />
            <span>Productivity Simulator</span>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1 dot-pattern justify-between">
            
            {/* Clicker counters */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Lines of Code</span>
                <span className="text-xl font-mono font-extrabold text-[#ff6b00]">{loc} LOC</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Passive Speed</span>
                <span className="text-sm font-mono font-bold text-zinc-800">{cps} LOC/sec</span>
              </div>
            </div>

            {/* Brew button */}
            <button
              onClick={manualClick}
              className="py-3 px-4 bg-[#ff6b00] hover:bg-[#ff8533] border-2 border-black rounded-xl text-black font-mono font-extrabold text-xs btn-spring flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000] active:translate-y-[2px] active:shadow-none cursor-pointer"
            >
              <Coffee size={14} />
              <span>Write Code manually (+1 LOC)</span>
            </button>

            {/* Upgrade listing */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Upgrade Equipment:</span>
              <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto">
                {upgrades.map((upg, idx) => {
                  const canBuy = loc >= upg.cost;
                  return (
                    <button
                      key={idx}
                      onClick={() => buyUpgrade(idx)}
                      disabled={!canBuy}
                      className={`flex items-center justify-between p-1.5 px-2.5 border-2 rounded-lg text-left transition-all ${
                        canBuy 
                          ? 'border-zinc-300 hover:border-[#ff6b00] bg-white cursor-pointer' 
                          : 'border-zinc-200 bg-zinc-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{upg.icon}</span>
                        <div>
                          <span className="font-mono text-[10px] font-bold block text-zinc-800">{upg.name}</span>
                          <span className="text-[8px] font-mono text-zinc-400 font-bold">Adds +{upg.cpsBonus} LOC/s (Owned: {upg.count})</span>
                        </div>
                      </div>
                      <span className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded ${canBuy ? 'bg-orange-50 text-[#ff6b00] border border-orange-200' : 'bg-zinc-100 text-zinc-500'}`}>
                        {upg.cost} LOC
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* 4. HIGH-FIDELITY BUBBLE WRAP */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000]">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Smile size={13} className="text-[#ff6b00]" />
            <span>High-Fidelity Bubble Wrap</span>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1 dot-pattern">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400">Pops: <strong className="text-zinc-900">{popCount}</strong></span>
              <button 
                onClick={resetBubbles}
                className="btn-secondary py-1 px-2.5 btn-spring font-mono text-[9px] font-bold"
              >
                🔄 Reset Sheet
              </button>
            </div>

            {/* Inline CSS animations for bubble popping */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes bubble-burst-ring {
                0% { transform: scale(0.7); opacity: 1; border-width: 2px; }
                100% { transform: scale(2.0); opacity: 0; border-width: 1px; }
              }
              @keyframes particle-n { 0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; } 100% { transform: translate(-50%, -50%) translateY(-22px); opacity: 0; } }
              @keyframes particle-s { 0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; } 100% { transform: translate(-50%, -50%) translateY(22px); opacity: 0; } }
              @keyframes particle-e { 0% { transform: translate(-50%, -50%) translateX(0); opacity: 1; } 100% { transform: translate(-50%, -50%) translateX(22px); opacity: 0; } }
              @keyframes particle-w { 0% { transform: translate(-50%, -50%) translateX(0); opacity: 1; } 100% { transform: translate(-50%, -50%) translateX(-22px); opacity: 0; } }
              .animate-burst-ring { animation: bubble-burst-ring 0.35s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
              .animate-pt-n { animation: particle-n 0.35s ease-out forwards; }
              .animate-pt-s { animation: particle-s 0.35s ease-out forwards; }
              .animate-pt-e { animation: particle-e 0.35s ease-out forwards; }
              .animate-pt-w { animation: particle-w 0.35s ease-out forwards; }
            `}} />

            <div className="grid grid-cols-8 gap-1.5 bg-zinc-100 p-2.5 rounded-xl border border-zinc-200 shadow-inner max-w-[280px] mx-auto">
              {bubbles.map((active, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePop(idx)}
                  className={`h-7 w-7 rounded-full font-bold text-[9px] flex items-center justify-center transition-all relative overflow-visible ${
                    active 
                      ? 'bg-gradient-to-br from-white to-zinc-100 border border-zinc-300 shadow-sm active:scale-90 cursor-pointer hover:from-white hover:to-orange-50 hover:border-orange-300' 
                      : 'bg-zinc-200 text-zinc-400 border border-zinc-300/40 pointer-events-none scale-90'
                  }`}
                >
                  {active ? (
                    <>
                      {/* Highlight reflection */}
                      <span className="absolute top-0.5 left-1 w-2 h-0.5 bg-white/80 rounded-full transform rotate-[-25deg] pointer-events-none"></span>
                      {/* Inner bubble shape */}
                      <span className="absolute inset-0.5 rounded-full border border-white/40 pointer-events-none"></span>
                    </>
                  ) : 'x'}

                  {/* Popping particle layers */}
                  {poppingList.filter(p => p.index === idx).map(p => (
                    <div key={p.id} className="absolute inset-0 pointer-events-none z-30 overflow-visible">
                      {/* Expanding Ring */}
                      <span className="absolute inset-0 rounded-full border-2 border-[#ff6b00] animate-burst-ring"></span>
                      {/* 4 Shooting Particles */}
                      <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-pt-n"></span>
                      <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-pt-s"></span>
                      <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-pt-e"></span>
                      <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-pt-w"></span>
                    </div>
                  ))}
                </button>
              ))}
            </div>
            
            <span className="text-[9px] text-zinc-400 font-mono text-center leading-normal">
              {popCount === bubbles.length 
                ? "🏆 All popped! Developer stress level decreased by 100%." 
                : "Tip: Clicking bubbles releases tension."}
            </span>
          </div>
        </div>

        {/* 5. CODE INCINERATOR */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000]">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Flame size={13} className="text-[#ff6b00]" />
            <span>Spaghetti Code Incinerator</span>
          </div>

          <div className="p-5 flex flex-col gap-3.5 flex-1 dot-pattern">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-zinc-400">Paste bad queries or legacy scripts here:</span>
              <textarea
                rows={3}
                value={incineratedCode}
                onChange={(e) => setIncineratedCode(e.target.value)}
                placeholder="E.g., SELECT * FROM users WHERE 1=1 OR name LIKE '%%';..."
                className="w-full text-xs font-mono p-2.5 border-2 border-zinc-200 rounded-lg focus:border-zinc-950 outline-none resize-none"
                disabled={isBurning}
              />
            </div>

            <button
              onClick={startIncinerate}
              disabled={isBurning || !incineratedCode.trim()}
              className="btn-primary py-2.5 btn-spring font-mono text-xs font-bold text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Flame size={14} className={isBurning ? "animate-pulse" : ""} />
              <span>{isBurning ? 'Vaporizing...' : 'Incinerate Code!'}</span>
            </button>

            {burnComplete && (
              <div className="p-2 bg-red-50 text-red-600 text-[10px] font-mono font-bold border border-red-200 rounded text-center animate-success-pop flex items-center justify-center gap-1">
                <span>🔥 Code vaporized. Database is clean. Feel the stress flow away!</span>
              </div>
            )}
          </div>
        </div>

        {/* 6. SUPPORT CAFFEINE STATION */}
        <div className="card bg-white border-2 border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-[4px_4px_0px_0px_#000000]">
          <div className="p-3 bg-zinc-950 border-b-2 border-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Coffee size={13} className="text-[#ff6b00]" />
            <span>Support VAPTechSol team</span>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1 dot-pattern justify-between">
            <div className="text-center flex flex-col gap-1">
              <span className="font-extrabold text-xs text-zinc-900 font-mono">Buy a Real Coffee</span>
              <p className="text-[10px] text-zinc-400 font-mono leading-normal">
                Help keep the developers awake. We run on pure caffeine and winking bracket algorithms!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleSupportCoffee(1, 5)}
                className="card p-2 bg-white hover:border-[#ff6b00] border-2 border-zinc-200 rounded-xl flex items-center justify-between px-3 btn-spring cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">☕</span>
                  <div className="text-left">
                    <span className="font-extrabold text-[10px] text-zinc-900 font-mono block">1 Coffee</span>
                    <span className="text-[9px] text-[#ff6b00] font-mono font-bold">Fueled Debugging</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-extrabold bg-zinc-100 px-2 py-0.5 rounded border">$5</span>
              </button>
              
              <button 
                onClick={() => handleSupportCoffee(3, 15)}
                className="card p-2 bg-white hover:border-[#ff6b00] border-2 border-zinc-200 rounded-xl flex items-center justify-between px-3 btn-spring cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">☕☕</span>
                  <div className="text-left">
                    <span className="font-extrabold text-[10px] text-zinc-900 font-mono block">3 Coffees</span>
                    <span className="text-[9px] text-[#ff6b00] font-mono font-bold">Squashed Bugs</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-extrabold bg-zinc-100 px-2 py-0.5 rounded border">$15</span>
              </button>
            </div>

            {boughtCoffeeMsg && (
              <div className="p-2 bg-green-50 text-green-700 text-[10px] font-mono font-bold border border-green-200 rounded text-center animate-success-pop">
                {boughtCoffeeMsg}
              </div>
            )}

            <div className="text-center font-mono text-[9px] text-zinc-400">
              Total virtual cups gifted: <strong className="text-zinc-800">{coffeePurchases}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Heartfelt VAPTechSol sign off */}
      <div className="text-center font-mono text-[10px] text-zinc-400 flex items-center justify-center gap-1 py-4">
        <span>Made with</span>
        <Heart size={10} className="text-[#ff6b00] fill-[#ff6b00]" />
        <span>for stressed developers worldwide. Take care of your back!</span>
      </div>

    </div>
  );
}
