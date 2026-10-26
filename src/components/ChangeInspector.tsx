import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  FileCode, 
  ArrowRight,
  GitCommit,
  CheckCircle2,
  X
} from 'lucide-react';
import type { DiffHunk, DetailedDiffResult } from '../utils/diffUtils';

interface ChangeInspectorProps {
  detailedDiff: DetailedDiffResult;
  onJumpToHunk: (hunk: DiffHunk) => void;
  onExportHtml: () => void;
  onCopyChangelog: () => void;
  isOpen: boolean;
  onClose: () => void;
  activeHunkId?: string | null;
}

export default function ChangeInspector({
  detailedDiff,
  onJumpToHunk,
  onExportHtml,
  onCopyChangelog,
  isOpen,
  onClose,
  activeHunkId
}: ChangeInspectorProps) {
  const [filterType, setFilterType] = useState<'all' | 'modified' | 'added' | 'deleted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPr, setCopiedPr] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [expandedHunkIds, setExpandedHunkIds] = useState<Record<string, boolean>>({});

  const { hunks, stats, smartSummary } = detailedDiff;

  const toggleHunk = (id: string) => {
    setExpandedHunkIds(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const handleCopyChangelog = () => {
    onCopyChangelog();
    setCopiedPr(true);
    setTimeout(() => setCopiedPr(false), 2000);
  };

  const filteredHunks = useMemo(() => {
    return hunks.filter(h => {
      // Type filter
      if (filterType !== 'all' && h.type !== filterType) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inSummary = h.summary.toLowerCase().includes(query);
        const inOrig = h.origLines.some(l => l.toLowerCase().includes(query));
        const inMod = h.modLines.some(l => l.toLowerCase().includes(query));
        return inSummary || inOrig || inMod;
      }
      return true;
    });
  }, [hunks, filterType, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="card bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ff6b00] w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 px-6 border-b-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff6b00]/10 border border-[#ff6b00]/30 rounded-lg text-[#ff6b00]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold font-mono tracking-tight text-zinc-950 dark:text-white">
                  Detailed Change Inspector
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {hunks.length} {hunks.length === 1 ? 'Change' : 'Changes'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                Exact breakdown of additions, deletions, modified tokens & lines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyChangelog}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 btn-spring"
              title="Copy PR notes with exact diff breakdown"
            >
              {copiedPr ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copiedPr ? 'Copied PR Notes!' : 'Copy PR Notes'}</span>
            </button>

            <button
              onClick={onExportHtml}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 btn-spring"
              title="Download standalone interactive HTML diff report"
            >
              <Download size={13} />
              <span>Export HTML</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors ml-2"
              title="Close Inspector (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 min-h-0">
          
          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="card p-3 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Similarity</span>
              <span className="text-xl font-extrabold text-[#ff6b00]">{stats.similarity}%</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">{stats.unchanged} lines unchanged</span>
            </div>

            <div className="card p-3 bg-green-500/5 border-green-500/20">
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider block">Additions</span>
              <span className="text-xl font-extrabold text-green-600 dark:text-green-400">+{stats.additions}</span>
              <span className="text-[10px] text-green-600/70 block mt-0.5">{stats.addedCount} inserted blocks</span>
            </div>

            <div className="card p-3 bg-red-500/5 border-red-500/20">
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">Deletions</span>
              <span className="text-xl font-extrabold text-red-600 dark:text-red-400">-{stats.deletions}</span>
              <span className="text-[10px] text-red-600/70 block mt-0.5">{stats.deletedCount} removed blocks</span>
            </div>

            <div className="card p-3 bg-amber-500/5 border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Modifications</span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">~{stats.modifiedCount}</span>
              <span className="text-[10px] text-amber-600/70 block mt-0.5">Line & token edits</span>
            </div>
          </div>

          {/* Smart AI / Semantic Change Summary Card */}
          <div className="card p-4 bg-orange-50/40 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/30">
            <div 
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setShowSummary(!showSummary)}
            >
              <div className="flex items-center gap-2">
                <GitCommit size={15} className="text-[#ff6b00]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Smart Semantic Summary ({smartSummary.length} Insights)
                </span>
              </div>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                {showSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showSummary && (
              <div className="mt-3 pt-3 border-t border-orange-200/60 dark:border-orange-900/30 flex flex-col gap-2 animate-fade-in">
                {smartSummary.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-500">No modifications found.</p>
                ) : (
                  smartSummary.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      <span className="text-[#ff6b00] font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-mono text-zinc-400 mr-1 flex items-center gap-1">
                <Filter size={12} />
              </span>
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All ({hunks.length})
              </button>

              <button
                onClick={() => setFilterType('modified')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'modified'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                Modified ({stats.modifiedCount})
              </button>

              <button
                onClick={() => setFilterType('added')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'added'
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
                }`}
              >
                Added ({stats.addedCount})
              </button>

              <button
                onClick={() => setFilterType('deleted')}
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg transition-all ${
                  filterType === 'deleted'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                }`}
              >
                Deleted ({stats.deletedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search within changes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg focus:border-[#ff6b00] outline-none"
              />
            </div>
          </div>

          {/* Detailed Hunk Cards List */}
          <div className="flex flex-col gap-3">
            {filteredHunks.length === 0 ? (
              <div className="card p-8 text-center flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono">
                {hunks.length === 0 ? (
                  <>
                    <CheckCircle2 size={32} className="text-green-500 mb-1" />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Both files are identical!</span>
                    <span className="text-xs">No differences were found between the original and modified snippets.</span>
                  </>
                ) : (
                  <>
                    <Search size={28} className="text-zinc-400 mb-1" />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">No matching changes found</span>
                    <span className="text-xs">Try clearing your search query or switching filter tabs.</span>
                  </>
                )}
              </div>
            ) : (
              filteredHunks.map((hunk, index) => {
                const isExpanded = expandedHunkIds[hunk.id] !== false;
                const isActive = activeHunkId === hunk.id;

                const badgeBg =
                  hunk.type === 'added'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                    : hunk.type === 'deleted'
                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';

                return (
                  <div
                    key={hunk.id}
                    className={`card overflow-hidden transition-all duration-200 ${
                      isActive
                        ? 'ring-2 ring-[#ff6b00] border-[#ff6b00]'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {/* Hunk Header */}
                    <div className="p-3 px-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          #{index + 1}
                        </span>

                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${badgeBg}`}>
                          {hunk.type}
                        </span>

                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <span>
                            {hunk.origStartLine > 0 ? `Orig L${hunk.origStartLine}${hunk.origEndLine > hunk.origStartLine ? `-${hunk.origEndLine}` : ''}` : 'New Lines'}
                          </span>
                          <ArrowRight size={11} className="text-zinc-400" />
                          <span>
                            {hunk.modStartLine > 0 ? `Mod L${hunk.modStartLine}${hunk.modEndLine > hunk.modStartLine ? `-${hunk.modEndLine}` : ''}` : 'Removed'}
                          </span>
                        </span>

                        <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hidden md:inline ml-2">
                          — {hunk.summary}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onJumpToHunk(hunk);
                            onClose();
                          }}
                          className="btn-terminal py-1 px-2.5 text-xs flex items-center gap-1 hover:text-[#ff6b00] btn-spring"
                          title="Jump to this line in Monaco Editor"
                        >
                          <ExternalLink size={11} />
                          <span>Locate</span>
                        </button>

                        <button
                          onClick={() => toggleHunk(hunk.id)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Hunk Code View */}
                    {isExpanded && (
                      <div className="p-3 bg-white dark:bg-zinc-950 font-mono text-xs overflow-x-auto leading-relaxed">
                        {/* Word-level diff preview if available */}
                        {hunk.wordDiff && hunk.wordDiff.length > 0 && (
                          <div className="mb-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                              Exact Token Differences:
                            </span>
                            <div className="flex flex-wrap items-baseline gap-0.5 break-all whitespace-pre-wrap">
                              {hunk.wordDiff.map((token, tIdx) => {
                                if (token.type === 'removed') {
                                  return (
                                    <span 
                                      key={tIdx} 
                                      className="bg-red-500/20 text-red-600 dark:text-red-400 line-through px-1 rounded mx-0.5 font-bold"
                                    >
                                      {token.text}
                                    </span>
                                  );
                                }
                                if (token.type === 'added') {
                                  return (
                                    <span 
                                      key={tIdx} 
                                      className="bg-green-500/20 text-green-600 dark:text-green-400 font-bold px-1 rounded mx-0.5"
                                    >
                                      {token.text}
                                    </span>
                                  );
                                }
                                return <span key={tIdx} className="text-zinc-600 dark:text-zinc-400">{token.text}</span>;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Raw Line Code View */}
                        <div className="flex flex-col gap-0.5 rounded overflow-hidden">
                          {hunk.origLines.map((line, lIdx) => (
                            <div
                              key={`orig-${lIdx}`}
                              className="flex items-start gap-2 bg-red-500/10 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-xs"
                            >
                              <span className="text-red-500 select-none font-bold shrink-0">-</span>
                              <span className="text-[11px] text-zinc-400 select-none w-8 text-right shrink-0">
                                {hunk.origStartLine + lIdx}
                              </span>
                              <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                            </div>
                          ))}

                          {hunk.modLines.map((line, lIdx) => (
                            <div
                              key={`mod-${lIdx}`}
                              className="flex items-start gap-2 bg-green-500/10 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-xs"
                            >
                              <span className="text-green-500 select-none font-bold shrink-0">+</span>
                              <span className="text-[11px] text-zinc-400 select-none w-8 text-right shrink-0">
                                {hunk.modStartLine + lIdx}
                              </span>
                              <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3 px-6 border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between text-xs font-mono text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
            <FileCode size={13} className="text-[#ff6b00]" />
            <span>Click &apos;Locate&apos; on any hunk to instantly jump and focus in the editor</span>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary py-1 px-4 text-xs font-bold btn-spring"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
