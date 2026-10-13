export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  originalLines: number;
  modifiedLines: number;
  similarity: number;
}

export function computeDiffStats(original: string, modified: string): DiffStats {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  if (original.trim() === modified.trim()) {
    return {
      additions: 0,
      deletions: 0,
      unchanged: origLines.length,
      originalLines: origLines.length,
      modifiedLines: modLines.length,
      similarity: 100
    };
  }

  const origSet = new Set(origLines);
  const modSet = new Set(modLines);

  let additions = 0;
  for (const line of modLines) {
    if (!origSet.has(line)) additions++;
  }

  let deletions = 0;
  for (const line of origLines) {
    if (!modSet.has(line)) deletions++;
  }

  const maxDiff = additions + deletions;
  const total = origLines.length + modLines.length || 1;
  const similarity = Math.max(0, Math.min(100, Math.round((1 - maxDiff / total) * 100)));

  return {
    additions,
    deletions,
    unchanged: Math.max(0, modLines.length - additions),
    originalLines: origLines.length,
    modifiedLines: modLines.length,
    similarity
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
