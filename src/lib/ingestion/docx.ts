/**
 * DOCX text extraction using mammoth (server-side only).
 */

export async function extractDOCXText(buffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const nodeBuffer = Buffer.from(buffer);
  const result = await mammoth.extractRawText({ buffer: nodeBuffer });
  return result.value ?? "";
}
