/* Turn printed emphasis (underlined or bold spans from the sheet) into
   pieces the check screen and the quiz can draw. The words stay exact. */

export interface TextPart {
  text: string;
  mark: boolean;
}

export function emphasisParts(text: string, emphasis: string[]): TextPart[] {
  if (!text) return [];
  const phrases = emphasis.map((item) => item.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return [{ text, mark: false }];
  const lower = text.toLowerCase();
  const ranges: { start: number; end: number }[] = [];
  for (const phrase of phrases) {
    const needle = phrase.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const at = lower.indexOf(needle, from);
      if (at < 0) break;
      const end = at + phrase.length;
      if (!ranges.some((range) => at < range.end && end > range.start)) {
        ranges.push({ start: at, end });
      }
      from = end;
    }
  }
  if (ranges.length === 0) return [{ text, mark: false }];
  ranges.sort((a, b) => a.start - b.start);
  const parts: TextPart[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start > cursor) parts.push({ text: text.slice(cursor, range.start), mark: false });
    parts.push({ text: text.slice(range.start, range.end), mark: true });
    cursor = range.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), mark: false });
  return parts;
}
