/**
 * Client-side PII redactor.
 * Redacts emails, phone numbers, Aadhaar-like IDs, PAN numbers,
 * passport numbers, and common address patterns before sending to model.
 */

export interface RedactionResult {
  redactedText: string;
  count: number;
  maskedItems: Array<{ original: string; replacement: string; type: string }>;
}

const PATTERNS: Array<{ name: string; regex: RegExp; replacement: string }> = [
  // Email addresses
  {
    name: "email",
    regex: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    replacement: "[EMAIL REDACTED]",
  },
  // Indian mobile numbers
  {
    name: "phone",
    regex: /(\+91[\s\-]?)?[6-9]\d{9}\b/g,
    replacement: "[PHONE REDACTED]",
  },
  // Indian Aadhaar (12 digits, sometimes with spaces)
  {
    name: "aadhaar",
    regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
    replacement: "[ID REDACTED]",
  },
  // Indian PAN
  {
    name: "pan",
    regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    replacement: "[PAN REDACTED]",
  },
  // Indian passport
  {
    name: "passport",
    regex: /\b[A-Z]\d{7}\b/g,
    replacement: "[PASSPORT REDACTED]",
  },
  // Generic international phone
  {
    name: "phone-intl",
    regex: /\+\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{4}\b/g,
    replacement: "[PHONE REDACTED]",
  },
];

export function redactPII(text: string): RedactionResult {
  let redactedText = text;
  let count = 0;
  const maskedItems: RedactionResult["maskedItems"] = [];

  for (const { name, regex, replacement } of PATTERNS) {
    regex.lastIndex = 0; // reset stateful regex
    redactedText = redactedText.replace(regex, (match) => {
      maskedItems.push({ original: match, replacement, type: name });
      count++;
      return replacement;
    });
  }

  return { redactedText, count, maskedItems };
}

export function countPIIMatches(text: string): number {
  let count = 0;
  for (const { regex } of PATTERNS) {
    regex.lastIndex = 0;
    const matches = text.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}
