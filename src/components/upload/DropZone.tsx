"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onFile: (file: File) => void;
  onText: (text: string) => void;
  disabled?: boolean;
}

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (![".pdf", ".docx", ".txt"].some((e) => name.endsWith(e)))
    return "Unsupported file type. Please upload PDF, DOCX, or TXT.";
  if (file.size > 15 * 1024 * 1024)
    return `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — maximum is 15 MB.`;
  return null;
}

export function DropZone({ onFile, onText, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError(null); onFile(file);
  }, [onFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError(null); onFile(file);
  }, [onFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!showPaste ? (
        <>
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && fileRef.current?.click()}
            role="button" tabIndex={disabled ? -1 : 0}
            aria-label="Upload document — click or drag and drop a PDF, DOCX, or TXT file"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
            animate={{ borderColor: isDragging ? "var(--pen-blue)" : "var(--border)", backgroundColor: isDragging ? "rgba(35,64,232,0.04)" : "transparent" }}
            className={`relative border-2 border-dashed rounded-sm p-10 text-center cursor-pointer ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--pen-blue)]"
            }`}>
            <div className="flex justify-center mb-4" aria-hidden="true">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="22" cy="22" r="14" stroke="var(--muted)" strokeWidth="3" fill="none" />
                <line x1="33" y1="33" x2="48" y2="48" stroke="var(--muted)" strokeWidth="3" strokeLinecap="round" />
                <motion.rect x="14" y="20" width="16" height="2" fill="var(--highlight)" rx="1"
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "14px 21px" }} />
              </svg>
            </div>
            <p className="font-display font-semibold text-lg mb-1">Drop your document here</p>
            <p className="font-mono text-xs text-[var(--muted)] mb-4">PDF · DOCX · TXT &nbsp;·&nbsp; Max 15 MB</p>
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[var(--pen-blue)] border border-[var(--pen-blue)] px-3 py-1.5 rounded-sm">Choose file</span>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="sr-only" onChange={handleFileInput} disabled={disabled} aria-hidden="true" />
          </motion.div>
          <div className="mt-3 text-center">
            <button onClick={() => setShowPaste(true)} className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] underline">Or paste text directly</button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="paste-area" className="font-mono text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Paste document text</label>
            <button onClick={() => setShowPaste(false)} className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] underline">Back to upload</button>
          </div>
          <textarea id="paste-area" value={pasteText} onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste your contract or legal document here..."
            className="w-full h-48 p-3 text-sm font-body bg-[var(--surface)] border border-[var(--border)] rounded-sm resize-none focus:outline-none focus:border-[var(--pen-blue)] text-[var(--fg)] placeholder:text-[var(--muted)]"
            aria-label="Document text input" />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--muted)]">{pasteText.length} characters</span>
            <button onClick={() => { if (pasteText.trim().length >= 50) { setError(null); onText(pasteText.trim()); } else setError("Too short — paste a full document."); }}
              disabled={pasteText.trim().length < 50}
              className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-2 rounded-sm disabled:opacity-40 hover:opacity-90">Analyse →</button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="alert" className="mt-3 text-sm text-[var(--stamp-red)] font-mono bg-[var(--stamp-red)]/10 border border-[var(--stamp-red)]/30 rounded-sm px-3 py-2">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
