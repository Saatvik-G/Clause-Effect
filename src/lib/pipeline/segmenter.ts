/**
 * Deterministic clause segmenter with stable IDs and character offsets.
 * Detects common legal document structures:
 * - Numbered sections (1., 1.1, Clause 1, Section 1, Article 1)
 * - Roman numerals (I., II., III.)
 * - Capitalised headers
 */

export interface RawSegment {
  id: string;
  index: number;
  title: string;
  body: string;
  fullText: string;
  charStart: number;
  charEnd: number;
}

export function segmentDocument(text: string): RawSegment[] {
  if (!text || text.trim().length === 0) return [];

  // Pattern matching section starts:
  // e.g. "1. PROPERTY", "Clause 2.", "Section 3 - RENT", "ARTICLE IV:"
  const sectionHeaderRegex = /(?:^|\n\n+)(?:(\d{1,2}\.|\b(?:Section|Clause|Article)\s+\d{1,2}[:.]?|\b[IVXLCDM]+\.)\s*([A-Z0-9\s,&'-]{3,60}))(?:\n|$)/gm;

  const matches: Array<{
    title: string;
    headerStart: number;
    contentStart: number;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = sectionHeaderRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const prefix = match[1] || "";
    const titleText = match[2] || "";
    const headerStart = match.index + (fullMatch.startsWith("\n\n") ? 2 : fullMatch.startsWith("\n") ? 1 : 0);
    const contentStart = match.index + fullMatch.length;
    const cleanTitle = `${prefix} ${titleText}`.trim().replace(/\s+/g, " ");

    matches.push({
      title: cleanTitle,
      headerStart,
      contentStart,
    });
  }

  // If no standard numbered headers are found, split by double line breaks as paragraphs
  if (matches.length < 2) {
    const paragraphs = text.split(/\n\s*\n+/);
    let currentOffset = 0;
    const segments: RawSegment[] = [];

    paragraphs.forEach((p, idx) => {
      const trimmed = p.trim();
      const pStart = text.indexOf(trimmed, currentOffset);
      const pEnd = pStart + trimmed.length;
      currentOffset = pEnd;

      if (trimmed.length > 30) {
        // First line or first 50 chars as title
        const firstLine = trimmed.split("\n")[0].trim().slice(0, 50);
        segments.push({
          id: `clause-${idx + 1}`,
          index: idx,
          title: firstLine.length > 5 ? firstLine : `Section ${idx + 1}`,
          body: trimmed,
          fullText: trimmed,
          charStart: pStart >= 0 ? pStart : 0,
          charEnd: pEnd >= 0 ? pEnd : trimmed.length,
        });
      }
    });

    return segments;
  }

  // Build segments from matches
  const segments: RawSegment[] = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const bodyEnd = next ? next.headerStart : text.length;
    const fullText = text.slice(current.headerStart, bodyEnd).trim();
    const body = text.slice(current.contentStart, bodyEnd).trim();

    segments.push({
      id: `clause-${i + 1}`,
      index: i,
      title: current.title,
      body,
      fullText,
      charStart: current.headerStart,
      charEnd: current.headerStart + fullText.length,
    });
  }

  return segments;
}
