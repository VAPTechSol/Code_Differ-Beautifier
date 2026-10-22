import React from 'react';

interface EditorSkeletonProps {
  label?: string;
}

export const EditorSkeleton: React.FC<EditorSkeletonProps> = ({ 
  label = 'Loading Editor & Grammar Synthesizer...' 
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-zinc-50/60 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden select-none animate-pulse">
      {/* Animated laser scan line */}
      <div 
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent pointer-events-none opacity-70"
        style={{
          animation: 'scanline 2s ease-in-out infinite'
        }}
      />

      {/* Simulated top editor tabs/gutter */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-amber-400/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
          <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded ml-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Center loader beacon */}
      <div className="my-auto flex flex-col items-center justify-center gap-3 text-center">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="w-6 h-6 border-2 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-200 tracking-tight">
            {label}
          </span>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
            Precision syntax trees & diff calculations
          </span>
        </div>
      </div>

      {/* Simulated code lines with line numbers */}
      <div className="flex flex-col gap-2.5 opacity-60">
        {[
          { num: '01', w: 'w-1/3' },
          { num: '02', w: 'w-2/3' },
          { num: '03', w: 'w-1/2' },
          { num: '04', w: 'w-3/4' },
          { num: '05', w: 'w-2/5' },
        ].map((line, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 w-4 text-right">
              {line.num}
            </span>
            <div className={`h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded ${line.w}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSkeleton;
