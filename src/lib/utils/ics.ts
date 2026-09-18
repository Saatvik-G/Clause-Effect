/**
 * Generates an iCalendar (.ics) format file string for legal document deadlines.
 */

export interface CalendarEvent {
  title: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  url?: string;
}

export function generateICS(events: CalendarEvent[]): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Clause & Effect//Legal Deadlines//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((ev, idx) => {
    // Parse YYYY-MM-DD
    const cleanDate = ev.dateStr.replace(/[^0-9-]/g, "").slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length < 3) return;

    const y = parts[0];
    const m = parts[1].padStart(2, "0");
    const d = parts[2].padStart(2, "0");
    const dtStart = `${y}${m}${d}`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:clause-effect-${dtStamp}-${idx}@clauseandeffect.ai`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`SUMMARY:${escapeICS(ev.title)}`);
    lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:OPAQUE");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Trigger client-side download of an .ics file
 */
export function downloadICSFile(filename: string, content: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
