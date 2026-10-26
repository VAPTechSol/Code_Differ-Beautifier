export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  originalLines: number;
  modifiedLines: number;
  similarity: number;
}

export interface WordDiffToken {
  type: 'same' | 'added' | 'removed';
  text: string;
}

export interface DiffHunk {
  id: string;
  type: 'added' | 'deleted' | 'modified';
  origStartLine: number;
  origEndLine: number;
  modStartLine: number;
  modEndLine: number;
  origLines: string[];
  modLines: string[];
  summary: string;
  wordDiff?: WordDiffToken[];
}

export interface DetailedDiffResult {
  stats: DiffStats & {
    charAdditions: number;
    charDeletions: number;
    modifiedCount: number;
    addedCount: number;
    deletedCount: number;
  };
  hunks: DiffHunk[];
  smartSummary: string[];
  markdownChangelog: string;
}

/**
 * Tokenize a string into words, symbols, and whitespace.
 */
function tokenizeWords(str: string): string[] {
  return str.match(/([a-zA-Z0-9_$]+|[^\s\w]|\s+)/g) || [];
}

/**
 * Token-level word diff for modified lines
 */
export function diffWords(str1: string, str2: string): WordDiffToken[] {
  const tokens1 = tokenizeWords(str1);
  const tokens2 = tokenizeWords(str2);

  const m = tokens1.length;
  const n = tokens2.length;
  if (m === 0 && n === 0) return [];
  if (m === 0) return [{ type: 'added', text: str2 }];
  if (n === 0) return [{ type: 'removed', text: str1 }];

  // Limit quadratic memory for exceptionally huge single lines (> 800 tokens)
  if (m > 800 || n > 800) {
    return [
      { type: 'removed', text: str1 },
      { type: 'added', text: str2 }
    ];
  }

  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tokens1[i] === tokens2[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const raw: WordDiffToken[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      raw.push({ type: 'same', text: tokens1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ type: 'added', text: tokens2[j - 1] });
      j--;
    } else if (i > 0) {
      raw.push({ type: 'removed', text: tokens1[i - 1] });
      i--;
    }
  }
  raw.reverse();

  // Merge contiguous tokens of the same type
  const merged: WordDiffToken[] = [];
  for (const item of raw) {
    if (merged.length > 0 && merged[merged.length - 1].type === item.type) {
      merged[merged.length - 1].text += item.text;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}

/**
 * Line-level hunk generator with prefix & suffix fast-path
 */
function diffLines(
  origLines: string[],
  modLines: string[],
  options?: { ignoreWhitespace?: boolean; ignoreCase?: boolean }
): DiffHunk[] {
  const m = origLines.length;
  const n = modLines.length;

  const normalize = (line: string) => {
    let s = line;
    if (options?.ignoreWhitespace) s = s.trim().replace(/\s+/g, ' ');
    if (options?.ignoreCase) s = s.toLowerCase();
    return s;
  };

  // 1. Common prefix lines
  let prefixCount = 0;
  while (
    prefixCount < m &&
    prefixCount < n &&
    normalize(origLines[prefixCount]) === normalize(modLines[prefixCount])
  ) {
    prefixCount++;
  }

  // 2. Common suffix lines
  let suffixCount = 0;
  while (
    suffixCount < m - prefixCount &&
    suffixCount < n - prefixCount &&
    normalize(origLines[m - 1 - suffixCount]) === normalize(modLines[n - 1 - suffixCount])
  ) {
    suffixCount++;
  }

  const midOrig = origLines.slice(prefixCount, m - suffixCount);
  const midMod = modLines.slice(prefixCount, n - suffixCount);

  const midM = midOrig.length;
  const midN = midMod.length;

  const common: { origIdx: number; modIdx: number }[] = [];
  if (midM > 0 && midN > 0) {
    // If diff is too massive (> 3500 lines slice), use fast greedy chunking to prevent memory lag
    if (midM * midN <= 2000000) {
      const dp = Array.from({ length: midM + 1 }, () => new Int32Array(midN + 1));
      for (let i = 0; i < midM; i++) {
        const normO = normalize(midOrig[i]);
        for (let j = 0; j < midN; j++) {
          if (normO === normalize(midMod[j])) {
            dp[i + 1][j + 1] = dp[i][j] + 1;
          } else {
            dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
          }
        }
      }

      let i = midM;
      let j = midN;
      while (i > 0 && j > 0) {
        if (normalize(midOrig[i - 1]) === normalize(midMod[j - 1])) {
          common.push({ origIdx: prefixCount + i - 1, modIdx: prefixCount + j - 1 });
          i--;
          j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }
      common.reverse();
    }
  }

  // Assemble matches
  const matches: { origIdx: number; modIdx: number }[] = [];
  for (let p = 0; p < prefixCount; p++) {
    matches.push({ origIdx: p, modIdx: p });
  }
  for (const c of common) {
    matches.push(c);
  }
  for (let s = 0; s < suffixCount; s++) {
    matches.push({ origIdx: m - suffixCount + s, modIdx: n - suffixCount + s });
  }

  const hunks: DiffHunk[] = [];
  let lastOrig = 0;
  let lastMod = 0;

  function pushHunk(oStart: number, oEnd: number, mStart: number, mEnd: number) {
    if (oStart >= oEnd && mStart >= mEnd) return;
    const oSlice = origLines.slice(oStart, oEnd);
    const mSlice = modLines.slice(mStart, mEnd);

    let type: 'added' | 'deleted' | 'modified' = 'modified';
    if (oSlice.length === 0 && mSlice.length > 0) type = 'added';
    else if (oSlice.length > 0 && mSlice.length === 0) type = 'deleted';

    // Generate descriptive explanation
    let summary = '';
    if (type === 'added') {
      if (mSlice.length === 1) {
        summary = `Added 1 line: "${truncate(mSlice[0].trim(), 40)}"`;
      } else {
        summary = `Added block of ${mSlice.length} lines`;
      }
    } else if (type === 'deleted') {
      if (oSlice.length === 1) {
        summary = `Deleted 1 line: "${truncate(oSlice[0].trim(), 40)}"`;
      } else {
        summary = `Removed block of ${oSlice.length} lines`;
      }
    } else {
      // Modified: inspect semantic changes
      summary = generateHunkSummary(oSlice, mSlice);
    }

    // Word diff for single or matching line counts
    let wordDiff: WordDiffToken[] | undefined;
    if (type === 'modified') {
      const oJoined = oSlice.join('\n');
      const mJoined = mSlice.join('\n');
      wordDiff = diffWords(oJoined, mJoined);
    }

    hunks.push({
      id: `hunk-${hunks.length + 1}`,
      type,
      origStartLine: oStart + 1,
      origEndLine: oEnd,
      modStartLine: mStart + 1,
      modEndLine: mEnd,
      origLines: oSlice,
      modLines: mSlice,
      summary,
      wordDiff
    });
  }

  for (const match of matches) {
    if (match.origIdx > lastOrig || match.modIdx > lastMod) {
      pushHunk(lastOrig, match.origIdx, lastMod, match.modIdx);
    }
    lastOrig = match.origIdx + 1;
    lastMod = match.modIdx + 1;
  }

  if (lastOrig < m || lastMod < n) {
    pushHunk(lastOrig, m, lastMod, n);
  }

  return hunks;
}

function truncate(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

function generateHunkSummary(origLines: string[], modLines: string[]): string {
  const oText = origLines.join(' ');
  const mText = modLines.join(' ');

  // Function signature changes
  if (/(function|const\s+\w+\s*=|def\s|public\s|private\s)/.test(oText) &&
      /(function|const\s+\w+\s*=|def\s|public\s|private\s|=>)/.test(mText)) {
    return 'Refactored function signature or declaration';
  }
  // Variable declaration changes (var -> const/let)
  if (/\bvar\s+\w+/.test(oText) && /\b(const|let)\s+\w+/.test(mText)) {
    return 'Upgraded variable declaration (var → const/let)';
  }
  // Return statement modified
  if (/\breturn\b/.test(oText) && /\breturn\b/.test(mText)) {
    return 'Updated return expression';
  }
  // Conditionals / Guard clauses
  if (!/\b(if|switch|guard)\b/.test(oText) && /\b(if|switch|guard)\b/.test(mText)) {
    return 'Added conditional check / guard clause';
  }
  // Imports / Modules
  if (/\b(import|require|from)\b/.test(oText) || /\b(import|require|from)\b/.test(mText)) {
    return 'Modified module imports or dependencies';
  }
  // SQL clause changes
  if (/\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY)\b/i.test(oText)) {
    return 'Updated SQL query clauses or filters';
  }
  // JSON key or configuration
  if (/["']\w+["']\s*:/.test(oText) || /["']\w+["']\s*:/.test(mText)) {
    return 'Updated configuration key-value properties';
  }

  if (origLines.length === 1 && modLines.length === 1) {
    return `Changed line ${origLines[0].trim().slice(0, 20)}...`;
  }

  return `Modified ${origLines.length} lines into ${modLines.length} lines`;
}

/**
 * Computes deep, detailed diff analysis:
 * - Exact hunks with line numbers
 * - Word-level differences
 * - Smart AI/Semantic summary bullet points
 * - Ready-to-use PR changelog markdown
 */
export function computeDetailedDiff(
  original: string,
  modified: string,
  options?: { ignoreWhitespace?: boolean; ignoreCase?: boolean; language?: string }
): DetailedDiffResult {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  if (original.trim() === modified.trim()) {
    const linesCount = origLines.length;
    return {
      stats: {
        additions: 0,
        deletions: 0,
        unchanged: linesCount,
        originalLines: linesCount,
        modifiedLines: modLines.length,
        similarity: 100,
        charAdditions: 0,
        charDeletions: 0,
        modifiedCount: 0,
        addedCount: 0,
        deletedCount: 0
      },
      hunks: [],
      smartSummary: ['Files are identical; no changes detected.'],
      markdownChangelog: '### No Changes\nFiles are completely identical.'
    };
  }

  const hunks = diffLines(origLines, modLines, options);

  let addedLines = 0;
  let deletedLines = 0;
  let modifiedCount = 0;
  let addedCount = 0;
  let deletedCount = 0;
  let charAdditions = 0;
  let charDeletions = 0;

  for (const h of hunks) {
    if (h.type === 'added') {
      addedLines += h.modLines.length;
      addedCount++;
      charAdditions += h.modLines.join('\n').length;
    } else if (h.type === 'deleted') {
      deletedLines += h.origLines.length;
      deletedCount++;
      charDeletions += h.origLines.join('\n').length;
    } else {
      // modified
      modifiedCount++;
      addedLines += h.modLines.length;
      deletedLines += h.origLines.length;
      charAdditions += h.modLines.join('\n').length;
      charDeletions += h.origLines.join('\n').length;
    }
  }

  const totalLines = origLines.length + modLines.length || 1;
  const similarity = Math.max(0, Math.min(100, Math.round((1 - (addedLines + deletedLines) / totalLines) * 100)));
  const unchangedLines = Math.max(0, origLines.length - deletedLines);

  // Generate Smart Summary Bullet Points
  const smartSummary: string[] = [];
  for (const hunk of hunks) {
    const loc =
      hunk.type === 'added'
        ? `Line ${hunk.modStartLine}${hunk.modEndLine > hunk.modStartLine ? `-${hunk.modEndLine}` : ''}`
        : hunk.type === 'deleted'
        ? `Line ${hunk.origStartLine}${hunk.origEndLine > hunk.origStartLine ? `-${hunk.origEndLine}` : ''}`
        : `Lines ${hunk.origStartLine} → ${hunk.modStartLine}`;

    smartSummary.push(`[${hunk.type.toUpperCase()}] (${loc}) - ${hunk.summary}`);
  }

  // Format PR Changelog Markdown
  const lang = options?.language || 'code';
  const changelogLines: string[] = [];
  changelogLines.push(`## 🔍 Diff Summary (${lang}): ${hunks.length} Changes Detected`);
  changelogLines.push(`- **Similarity**: \`${similarity}%\``);
  changelogLines.push(`- **Lines**: \`+${addedLines}\` added, \`-${deletedLines}\` deleted, \`${unchangedLines}\` unchanged`);
  changelogLines.push(`- **Breakdown**: ${addedCount} additions, ${deletedCount} deletions, ${modifiedCount} modifications\n`);
  changelogLines.push(`### 📝 Detailed Changes:`);

  hunks.forEach((h, index) => {
    changelogLines.push(`${index + 1}. **${h.type.toUpperCase()}** (${h.origStartLine ? `L${h.origStartLine}` : ''} → ${h.modStartLine ? `L${h.modStartLine}` : ''}): ${h.summary}`);
    if (h.type === 'modified' && h.origLines.length <= 4 && h.modLines.length <= 4) {
      changelogLines.push('   ```diff');
      h.origLines.forEach(l => changelogLines.push(`   - ${l}`));
      h.modLines.forEach(l => changelogLines.push(`   + ${l}`));
      changelogLines.push('   ```');
    }
  });

  return {
    stats: {
      additions: addedLines,
      deletions: deletedLines,
      unchanged: unchangedLines,
      originalLines: origLines.length,
      modifiedLines: modLines.length,
      similarity,
      charAdditions,
      charDeletions,
      modifiedCount,
      addedCount,
      deletedCount
    },
    hunks,
    smartSummary,
    markdownChangelog: changelogLines.join('\n')
  };
}

/**
 * Backward compatible computeDiffStats
 */
export function computeDiffStats(original: string, modified: string): DiffStats {
  const result = computeDetailedDiff(original, modified);
  return {
    additions: result.stats.additions,
    deletions: result.stats.deletions,
    unchanged: result.stats.unchanged,
    originalLines: result.stats.originalLines,
    modifiedLines: result.stats.modifiedLines,
    similarity: result.stats.similarity
  };
}

export function generateMarkdownDiff(original: string, modified: string, filename = 'snippet'): string {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const lines: string[] = [];

  lines.push('```diff');
  lines.push(`--- a/${filename}`);
  lines.push(`+++ b/${filename}`);

  const maxLen = Math.max(origLines.length, modLines.length);
  for (let i = 0; i < maxLen; i++) {
    const orig = origLines[i];
    const mod = modLines[i];
    if (orig === mod) {
      if (orig !== undefined) lines.push(`  ${orig}`);
    } else {
      if (orig !== undefined) lines.push(`- ${orig}`);
      if (mod !== undefined) lines.push(`+ ${mod}`);
    }
  }
  lines.push('```');
  return lines.join('\n');
}

export function downloadPatchFile(original: string, modified: string, filename = 'changes.patch') {
  const md = generateMarkdownDiff(original, modified);
  const blob = new Blob([md], { type: 'text/x-diff;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function encodeDiffShare(original: string, modified: string, lang = 'javascript'): string {
  try {
    const payload = JSON.stringify({ o: original, m: modified, l: lang });
    return btoa(encodeURIComponent(payload));
  } catch {
    return '';
  }
}

export function decodeDiffShare(hash: string): { original: string; modified: string; lang: string } | null {
  try {
    if (!hash) return null;
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!cleanHash.startsWith('diff=')) return null;
    const rawB64 = cleanHash.replace('diff=', '');
    const decoded = decodeURIComponent(atob(rawB64));
    const data = JSON.parse(decoded);
    return {
      original: data.o ?? '',
      modified: data.m ?? '',
      lang: data.l ?? 'javascript'
    };
  } catch {
    return null;
  }
}

/**
 * Generate a standalone, interactive, self-contained HTML diff report
 */
export function generateHtmlDiffReport(
  original: string,
  modified: string,
  filename = 'code-comparison',
  language = 'javascript'
): string {
  const detailed = computeDetailedDiff(original, modified, { language });
  const { stats, hunks, smartSummary } = detailed;
  const now = new Date().toLocaleString();

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const hunksHtml = hunks
    .map((h) => {
      const typeColor =
        h.type === 'added' ? '#10b981' : h.type === 'deleted' ? '#ef4444' : '#f59e0b';
      const origLinesStr = h.origLines.map(l => `<div class="line del">- ${escapeHtml(l)}</div>`).join('');
      const modLinesStr = h.modLines.map(l => `<div class="line add">+ ${escapeHtml(l)}</div>`).join('');

      return `
      <div class="hunk-card">
        <div class="hunk-header">
          <span class="badge" style="background:${typeColor}22; color:${typeColor}; border:1px solid ${typeColor}66;">
            ${h.type.toUpperCase()}
          </span>
          <span class="hunk-loc">Orig: L${h.origStartLine || 0}${h.origEndLine > h.origStartLine ? `-${h.origEndLine}` : ''} → Mod: L${h.modStartLine || 0}${h.modEndLine > h.modStartLine ? `-${h.modEndLine}` : ''}</span>
          <span class="hunk-summary">${escapeHtml(h.summary)}</span>
        </div>
        <div class="code-block">
          ${origLinesStr}
          ${modLinesStr}
        </div>
      </div>
    `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Align Studio Diff Report - ${escapeHtml(filename)}</title>
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #ff6b00;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 32px 20px;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .title-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .accent { color: var(--accent); }
    .meta { color: var(--muted); font-size: 13px; margin-top: 6px; }
    .stats-bar {
      display: flex;
      gap: 16px;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .stat-pill {
      background: #27272a;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      font-family: monospace;
    }
    .stat-add { color: #10b981; }
    .stat-del { color: #ef4444; }
    .stat-sim { color: var(--accent); }
    .summary-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .summary-card h3 { margin-top: 0; font-size: 16px; color: var(--accent); }
    ul { margin: 0; padding-left: 20px; color: var(--text); font-size: 13px; font-family: monospace; }
    li { margin-bottom: 6px; }
    .hunk-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .hunk-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: #202024;
      border-bottom: 1px solid var(--border);
      font-size: 12px;
      font-family: monospace;
      flex-wrap: wrap;
    }
    .badge {
      font-size: 10px;
      font-weight: bold;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .hunk-loc { color: var(--muted); }
    .hunk-summary { font-weight: bold; color: var(--text); }
    .code-block {
      padding: 12px 16px;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 12px;
      overflow-x: auto;
    }
    .line { white-space: pre-wrap; word-break: break-all; padding: 2px 0; }
    .line.del { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .line.add { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
    .footer { text-align: center; color: var(--muted); font-size: 12px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title-row">
        <div>
          <h1>Align <span class="accent">Studio</span> Diff Report</h1>
          <div class="meta">Target: <strong>${escapeHtml(filename)}</strong> • Language: <strong>${escapeHtml(language)}</strong> • Generated: ${escapeHtml(now)}</div>
        </div>
      </div>
      <div class="stats-bar">
        <div class="stat-pill stat-sim">Similarity: ${stats.similarity}%</div>
        <div class="stat-pill stat-add">+${stats.additions} lines added</div>
        <div class="stat-pill stat-del">-${stats.deletions} lines deleted</div>
        <div class="stat-pill">${hunks.length} changed hunks</div>
      </div>
    </div>

    <div class="summary-card">
      <h3>📋 What Changed (Summary)</h3>
      <ul>
        ${smartSummary.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 14px;">Detailed Changes</h2>
    ${hunksHtml || '<p style="color:var(--muted)">No differences detected.</p>'}

    <div class="footer">
      Generated with ❤️ by <strong>Align Studio</strong> (VAPTechSol) • www.vaptechsol.com
    </div>
  </div>
</body>
</html>`;
}

export function downloadHtmlReport(
  original: string,
  modified: string,
  filename = 'diff_report.html',
  language = 'javascript'
) {
  const html = generateHtmlDiffReport(original, modified, filename, language);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
