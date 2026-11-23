/**
 * Search-friendly text: lower case, Latin accents removed, Arabic diacritics (tashkeel) and tatweel
 * removed, أ/إ/آ/ٱ → ا, ى → ي, ة → ه, whitespace collapsed. `map[i]` is the index in the ORIGINAL
 * text of the i-th normalised character, so a match can be highlighted in the original.
 */
export function normalizeSearch(text: string): { value: string; map: number[] } {
  let value = '';
  const map: number[] = [];
  let lastSpace = true;
  for (let i = 0; i < text.length; i++) {
    let c = text[i];
    // Arabic marks: tashkeel U+064B–U+065F, superscript alef U+0670, Quranic marks U+06D6–U+06ED, tatweel.
    if (/[ً-ٰٟۖ-ۭـ]/.test(c)) continue;
    // Arabic letter variants first (NFD would split إ into ا + a combining hamza).
    if (/[أإآٱ]/.test(c)) c = 'ا';
    else if (c === 'ى') c = 'ي';
    else if (c === 'ة') c = 'ه';
    // Latin: strip combining accents (é → e); any Arabic mark a decomposition produced goes too.
    c = c.normalize('NFD').replace(/[̀-ًͯ-ٰٟ]/g, '').toLowerCase();
    if (c === '') continue;
    if (/\s/.test(c)) {
      if (lastSpace) continue;
      c = ' ';
      lastSpace = true;
    } else lastSpace = false;
    for (const ch of c) {
      value += ch;
      map.push(i);
    }
  }
  if (value.endsWith(' ')) {
    value = value.slice(0, -1);
    map.pop();
  }
  return { value, map };
}

/** Normalised query tokens (empty query → []). */
export function searchTokens(query: string): string[] {
  return normalizeSearch(query).value.split(' ').filter(Boolean);
}

/**
 * Where `token` occurs in `text` (normalised comparison), as [start, end) in the ORIGINAL text,
 * or null. Used to highlight the match.
 */
export function matchRange(text: string, token: string): [number, number] | null {
  if (!token) return null;
  const { value, map } = normalizeSearch(text);
  const at = value.indexOf(token);
  if (at < 0) return null;
  const start = map[at];
  const end = map[at + token.length - 1] + 1;
  return [start, end];
}
