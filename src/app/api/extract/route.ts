import { NextRequest, NextResponse } from "next/server";
import { normaliseText } from "@/lib/utils/helpers";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed is 15 MB.`,
      },
      { status: 422 }
    );
  }

  // Validate type
  const fileType = file.type || "application/octet-stream";
  const fileName = file.name.toLowerCase();

  const isPDF = fileType === "application/pdf" || fileName.endsWith(".pdf");
  const isDOCX =
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");
  const isTXT = fileType === "text/plain" || fileName.endsWith(".txt");

  if (!isPDF && !isDOCX && !isTXT) {
    return NextResponse.json(
      {
        error: "UNSUPPORTED_TYPE",
        message:
          "Unsupported file type. Please upload a PDF, DOCX, or TXT file. For image scans, use the image upload option.",
      },
      { status: 422 }
    );
  }

  try {
    const buffer = await file.arrayBuffer();
    let text = "";
    let pageCount: number | undefined;
    let isScanned = false;

    if (isPDF) {
      const { extractPDFText } = await import("@/lib/ingestion/pdf");
      const result = await extractPDFText(buffer);
      text = result.text;
      pageCount = result.pageCount;
      isScanned = result.isScanned;

      if (isScanned) {
        return NextResponse.json(
          {
            error: "SCANNED_PDF",
            message:
              "This appears to be a scanned PDF with no extractable text. Try copying the text manually and using the 'Paste text' option, or use the image/OCR upload feature.",
            pageCount,
          },
          { status: 422 }
        );
      }
    } else if (isDOCX) {
      const { extractDOCXText } = await import("@/lib/ingestion/docx");
      text = await extractDOCXText(buffer);
    } else {
      // TXT
      text = new TextDecoder("utf-8").decode(buffer);
    }

    if (!text || text.trim().length < 30) {
      return NextResponse.json(
        {
          error: "EMPTY_FILE",
          message: "The file appears to be empty or contains no readable text.",
        },
        { status: 422 }
      );
    }

    const normalisedText = normaliseText(text);

    return NextResponse.json({
      text: normalisedText,
      pageCount,
      fileType: isPDF ? "pdf" : isDOCX ? "docx" : "txt",
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err) {
    console.error("[extract] Error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.includes("Invalid PDF") || message.includes("corrupt")) {
      return NextResponse.json(
        {
          error: "CORRUPT_FILE",
          message:
            "The file appears to be corrupted or is not a valid document. Try saving it again or use a different format.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "EXTRACT_FAILED", message: "Failed to read the file. Please try again." },
      { status: 500 }
    );
  }
}
