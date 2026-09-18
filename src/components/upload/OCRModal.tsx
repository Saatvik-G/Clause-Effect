"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractedText: (text: string) => void;
}

export function OCRModal({ isOpen, onClose, onExtractedText }: OCRModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setExtractedText("");
    setStatusText("");
    setProgress(0);
  };

  const runOCR = async () => {
    if (!imageFile) return;
    setIsProcessing(true);
    setStatusText("Initializing OCR engine...");
    setProgress(10);

    try {
      // Lazy load Tesseract.js only when OCR is invoked!
      const Tesseract = await import("tesseract.js");

      setStatusText("Analyzing document image...");
      const result = await Tesseract.recognize(imageFile, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatusText(`Recognizing printed text... ${Math.round((m.progress || 0) * 100)}%`);
            setProgress(Math.round((m.progress || 0) * 100));
          }
        },
      });

      const text = result.data.text.trim();
      setExtractedText(text);
      setStatusText("Text extracted! Review and edit below before proceeding.");
    } catch (err) {
      console.error("[OCR error]", err);
      setStatusText("Failed to extract text from image. Please try a clearer scan or paste directly.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (extractedText.trim().length >= 50) {
      onExtractedText(extractedText.trim());
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--ink)]/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-label="Image and Scan OCR Text Extractor"
      aria-modal="true"
    >
      <div className="paper-sheet paper-texture rounded-sm p-6 max-w-2xl w-full border-2 border-[var(--border)] shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">📷</span>
            <h2 className="font-display font-bold text-base text-[var(--fg)]">
              Scan / Photo OCR Text Extraction
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1"
            aria-label="Close OCR Modal"
          >
            ✕
          </button>
        </div>

        <p className="font-body text-xs text-[var(--muted)] mb-3">
          Upload a photo or scanned image of your contract (PNG, JPG, WEBP). Text is processed locally in your browser.
        </p>

        {/* Drop / Select Image */}
        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-sm p-8 text-center cursor-pointer hover:border-[var(--pen-blue)] hover:bg-[var(--pen-blue)]/5 transition-colors"
          >
            <span className="text-3xl block mb-2" aria-hidden="true">📄</span>
            <span className="font-display font-semibold text-sm text-[var(--fg)] block mb-1">
              Select contract photograph or scan
            </span>
            <span className="font-mono text-xs text-[var(--muted)]">
              PNG, JPG, WEBP up to 10 MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
            />
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-mono">
              <span>Selected: <strong>{imageFile?.name}</strong></span>
              <button
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  setExtractedText("");
                }}
                className="text-[var(--stamp-red)] hover:underline"
              >
                Change image
              </button>
            </div>

            {!extractedText && (
              <button
                onClick={runOCR}
                disabled={isProcessing}
                className="w-full font-mono text-xs font-bold text-white bg-[var(--pen-blue)] py-2.5 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isProcessing ? "Processing OCR in Browser..." : "Start Text Extraction (OCR) →"}
              </button>
            )}

            {statusText && (
              <div className="text-xs font-mono text-[var(--muted)]">
                {statusText}
                {isProcessing && (
                  <div className="h-1 bg-[var(--border)] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-[var(--pen-blue)] transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Editable Text Area */}
            {extractedText && (
              <div>
                <label className="font-mono text-[0.65rem] text-[var(--muted)] uppercase tracking-wider block mb-1">
                  Editable Extracted Text (Verify and correct any OCR typos):
                </label>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-48 p-3 text-xs font-body bg-[var(--surface)] border border-[var(--border)] rounded-sm resize-none focus:outline-none focus:border-[var(--pen-blue)] text-[var(--fg)] leading-relaxed"
                  aria-label="Editable OCR extracted text"
                />
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] px-3 py-1.5 rounded-sm border border-[var(--border)]"
          >
            Cancel
          </button>
          {extractedText && (
            <button
              onClick={handleConfirm}
              disabled={extractedText.trim().length < 50}
              className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-1.5 rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              Analyze Extracted Text →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
