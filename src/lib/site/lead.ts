/** Minimal HTML → text for plain checks (descriptions come from the CMS rich editor). */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits a rich description into a statement lead (its first sentence, plain text) and the rest
 * (HTML, the sentence removed). Works for plain text and for editor HTML whose first sentence has no
 * inline markup; otherwise there is no lead and the whole HTML is the body (nothing is ever lost).
 */
export function splitLead(html: string | null | undefined): { lead: string | null; body: string } {
  const source = (html ?? '').trim();
  if (!source) return { lead: null, body: '' };
  const match = textOf(source).match(/^(.+?[.!?؟])(?:\s|$)/);
  if (!match) return { lead: null, body: source };
  const lead = match[1];
  const at = source.indexOf(lead);
  if (at < 0) return { lead: null, body: source };
  const body = (source.slice(0, at) + source.slice(at + lead.length)).replace(/<p>\s*<\/p>/g, '').trim();
  return { lead, body: textOf(body) ? body : '' };
}
