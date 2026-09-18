/**
 * Content hasher using Web Crypto API (browser) or Node crypto (server).
 * Returns SHA-256 hex string.
 */
export async function hashContent(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    // Browser / Edge runtime
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Node.js runtime
    const { createHash } = await import("crypto");
    return createHash("sha256").update(text).digest("hex");
  }
}

/**
 * Truncate text to a maximum character count with a note.
 */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + `\n\n[Document truncated at ${maxChars} characters for analysis]`;
}

/**
 * Sanitise a string for safe rendering (escape HTML entities).
 * Use this instead of dangerouslySetInnerHTML.
 */
export function sanitiseForDisplay(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format a number as Indian currency.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normalise whitespace in extracted text.
 */
export function normaliseText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}
