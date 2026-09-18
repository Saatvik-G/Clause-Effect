/**
 * Quote verifier — ensures every verbatimQuote from the LLM
 * actually appears in the source document text.
 *
 * Matching is whitespace-normalised and case-insensitive for robustness.
 */

/**
 * Normalise text for comparison: collapse whitespace, lowercase.
 */
function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Returns true if `quote` is a substring of `sourceText`
 * (after whitespace normalisation and lowercasing).
 */
export function verifyQuote(quote: string, sourceText: string): boolean {
  if (!quote || quote.length < 5) return false;
  const normQuote = normalise(quote);
  const normSource = normalise(sourceText);
  return normSource.includes(normQuote);
}

/**
 * Verify all string values in an object against source text.
 * Returns a list of field names that failed verification.
 *
 * `fieldsToVerify` maps field name → value to check.
 */
export function verifyFields(
  fieldsToVerify: Record<string, string>,
  sourceText: string
): string[] {
  const failed: string[] = [];
  for (const [field, value] of Object.entries(fieldsToVerify)) {
    if (value && !verifyQuote(value, sourceText)) {
      failed.push(field);
    }
  }
  return failed;
}

/**
 * Check if a value (name, amount, date) appears in source.
 * Uses a more lenient match — just checks if the value appears anywhere.
 */
export function verifyValueInSource(value: string, sourceText: string): boolean {
  if (!value || value.length < 2) return true; // skip very short values
  const normValue = normalise(value);
  const normSource = normalise(sourceText);
  return normSource.includes(normValue);
}

/**
 * Verify a clause object. Returns verified flag and list of failed fields.
 */
export function verifyClause(
  clause: { verbatimQuote: string; [key: string]: unknown },
  sourceText: string
): { verified: boolean; unverifiedFields: string[] } {
  const failed: string[] = [];

  if (!verifyQuote(clause.verbatimQuote, sourceText)) {
    failed.push("verbatimQuote");
  }

  return {
    verified: failed.length === 0,
    unverifiedFields: failed,
  };
}
