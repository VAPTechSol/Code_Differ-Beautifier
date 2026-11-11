import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { DetailedDiffResult } from '../utils/diffUtils';

interface MobileDiffViewerProps {
  detailedDiff: DetailedDiffResult;
  originalCode: string;
  modifiedCode: string;
}

export const MobileDiffViewer: React.FC<MobileDiffViewerProps> = ({
  detailedDiff,
  originalCode,
  modifiedCode
}) => {
  const [activeHunkIndex, setActiveHunkIndex] = useState(0);
  const { hunks, stats } = detailedDiff;
  const isIdentical = originalCode.trim() === modifiedCode.trim();

  const handlePrev = () => {
    if (hunks.length === 0) return;
    setActiveHunkIndex((prev) => (prev - 1 + hunks.length) % hunks.length);
  };

  const handleNext = () => {
    if (hunks.length === 0) return;
    setActiveHunkIndex((prev) => (prev + 1) % hunks.length);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Mobile Diff HUD */}
      <div className="p-2.5 px-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-extrabold text-[#ff6b00]">
            {stats.similarity}% Match
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-bold">
            +{stats.additions}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold">
            -{stats.deletions}
          </span>
        </div>

        {/* Diff Hunk Navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={hunks.length === 0}
            className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-30"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-[10px] font-mono font-bold px-1.5 text-zinc-600 dark:text-zinc-300">
            {hunks.length > 0 ? `${activeHunkIndex + 1}/${hunks.length}` : '0 Diffs'}
          </span>
          <button
            onClick={handleNext}
            disabled={hunks.length === 0}
            className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 disabled:opacity-30"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Diff Content Viewport */}
      <div className="flex-1 min-h-0 overflow-auto p-2 font-mono text-[11px] leading-[18px] touch-scroll select-text">
        {isIdentical ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-green-600 dark:text-green-400 gap-2">
            <Check size={28} />
            <span className="font-bold">Both files are identical!</span>
            <span className="text-xs text-zinc-400">Zero differences detected.</span>
          </div>
        ) : hunks.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-zinc-400">
            No line changes to display.
          </div>
        ) : (
          <div className="space-y-3">
            {hunks.map((hunk, hIdx) => {
              const isActive = hIdx === activeHunkIndex;
              return (
                <div
                  key={hunk.id}
                  className={`rounded-lg border overflow-hidden transition-all ${
                    isActive
                      ? 'border-[#ff6b00] ring-1 ring-[#ff6b00]/40 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {/* Hunk Header */}
                  <div className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-500 font-bold flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                    <span>
                      Orig L{hunk.origStartLine} → Mod L{hunk.modStartLine}
                    </span>
                    <span className="text-zinc-400 uppercase tracking-widest text-[9px]">
                      {hunk.type}
                    </span>
                  </div>

                  {/* Deleted lines */}
                  {hunk.origLines.map((line, idx) => (
                    <div
                      key={`del-${idx}`}
                      className="flex items-start bg-red-500/10 text-red-700 dark:text-red-300 px-2 py-0.5 border-b border-red-500/10"
                    >
                      <span className="w-5 shrink-0 text-red-500 font-bold select-none">-</span>
                      <pre className="flex-1 font-mono text-[11px] whitespace-pre overflow-x-auto m-0">
                        {line || ' '}
                      </pre>
                    </div>
                  ))}

                  {/* Added lines */}
                  {hunk.modLines.map((line, idx) => (
                    <div
                      key={`add-${idx}`}
                      className="flex items-start bg-green-500/10 text-green-700 dark:text-green-300 px-2 py-0.5 border-b border-green-500/10 last:border-b-0"
                    >
                      <span className="w-5 shrink-0 text-green-500 font-bold select-none">+</span>
                      <pre className="flex-1 font-mono text-[11px] whitespace-pre overflow-x-auto m-0">
                        {line || ' '}
                      </pre>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileDiffViewer;
