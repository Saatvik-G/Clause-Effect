"use client";

import type { RedactionResult } from "@/lib/pipeline/redactor";

interface PIIPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  redactionResult: RedactionResult | null;
  onConfirm: () => void;
}

export function PIIPreviewModal({
  isOpen,
  onClose,
  redactionResult,
  onConfirm,
}: PIIPreviewModalProps) {
  if (!isOpen || !redactionResult) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--ink)]/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-label="Client-Side PII Redaction Preview"
      aria-modal="true"
    >
      <div className="paper-sheet paper-texture rounded-sm p-6 max-w-xl w-full border-2 border-[var(--border)] shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🛡️</span>
            <h2 className="font-display font-bold text-base text-[var(--fg)]">
              Client-Side PII Redaction Active
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1"
            aria-label="Close PII Preview"
          >
            ✕
          </button>
        </div>

        <p className="font-body text-xs text-[var(--muted)] mb-3">
          To protect your privacy, personal identifiable information (emails, phone numbers, Aadhaar, PAN) was detected and masked before transmitting text to the AI model.
        </p>

        <div className="bg-[var(--paper-dark)] p-3 rounded-sm mb-4">
          <span className="font-mono text-xs font-bold text-[var(--safe)]">
            ✓ {redactionResult.count} sensitive item{redactionResult.count === 1 ? "" : "s"} masked
          </span>
          <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {redactionResult.maskedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-mono bg-[var(--surface)] p-2 rounded-sm border border-[var(--border)]"
              >
                <span className="text-[var(--muted)] uppercase text-[0.6rem]">
                  [{item.type}]
                </span>
                <span className="text-[var(--fg)] blur-xs hover:blur-none transition-all cursor-help" title="Hover to view unmasked original">
                  {item.original}
                </span>
                <span className="text-[var(--pen-blue)] font-semibold text-[0.65rem]">
                  → {item.replacement}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] px-3 py-1.5 rounded-sm border border-[var(--border)]"
          >
            Edit Document
          </button>
          <button
            onClick={onConfirm}
            className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-1.5 rounded-sm hover:opacity-90"
          >
            Proceed with Protected Text →
          </button>
        </div>
      </div>
    </div>
  );
}
