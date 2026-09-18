/**
 * PDF text extraction using pdfjs-dist (server-side only).
 * Extracts text page by page and returns normalised plain text.
 */

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  isScanned: boolean; // True if text content is very sparse (likely scanned)
}

export async function extractPDFText(buffer: ArrayBuffer): Promise<PDFExtractionResult> {
  // Dynamic import to avoid bundling on client
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Worker is not needed in Node.js environment
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array, disableStream: true });
  const pdf = await loadingTask.promise;

  const pageCount = pdf.numPages;
  const pages: string[] = [];
  let totalChars = 0;

  for (let i = 1; i <= Math.min(pageCount, 60); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => {
        if ("str" in item) return item.str;
        return "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
    totalChars += pageText.length;
  }

  const text = pages.join("\n\n");

  // Heuristic: if average chars per page < 100, likely a scanned PDF
  const avgCharsPerPage = totalChars / pageCount;
  const isScanned = avgCharsPerPage < 100;

  return { text, pageCount, isScanned };
}
