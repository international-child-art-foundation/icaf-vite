export interface ITranscriptCue {
  start: number;
  end: number;
  text: string;
}

function parseTimestamp(ts: string): number {
  const m = ts.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) return NaN;
  const hours = m[1] ? parseInt(m[1], 10) : 0;
  const mins = parseInt(m[2], 10);
  const secs = parseInt(m[3], 10);
  const ms = parseInt(m[4].padEnd(3, '0'), 10);
  return hours * 3600 + mins * 60 + secs + ms / 1000;
}

export function parseVTT(source: string): ITranscriptCue[] {
  const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const blocks = text.split(/\n\n+/);
  const cues: ITranscriptCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').filter((l) => l.length > 0);
    if (lines.length === 0) continue;

    const arrowIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowIdx === -1) continue;

    const [startStr, endStr] = lines[arrowIdx]
      .split('-->')
      .map((s) => s.trim());
    const start = parseTimestamp(startStr);
    const end = parseTimestamp(endStr.split(/\s+/)[0]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;

    const textLines = lines.slice(arrowIdx + 1);
    const cueText = textLines.join(' ').trim();
    if (!cueText) continue;

    cues.push({ start, end, text: cueText });
  }

  return cues;
}
