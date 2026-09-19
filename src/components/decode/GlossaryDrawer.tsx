"use client";

import { useState } from "react";
import { LEGAL_GLOSSARY } from "@/lib/glossary/legal-terms";

export function GlossaryDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = LEGAL_GLOSSARY.filter((t) =>
    t.term.toLowerCase().includes(search.toLowerCase()) ||
    t.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] px-2.5 py-1 rounded border border-[var(--border)] hover:border-[var(--muted)] flex items-center gap-1.5 transition-colors"
        aria-label="Open Legal Terms Glossary"
      >
        <span aria-hidden="true">📖</span> Legal Glossary
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[var(--ink)]/40 flex justify-end"
          role="dialog"
          aria-label="Legal Glossary Drawer"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-[var(--surface)] border-l border-[var(--border)] h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">📖</span>
                <h2 className="font-display font-bold text-lg text-[var(--fg)]">
                  Legal Jargon Glossary
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--fg)] text-xl font-mono p-1"
                aria-label="Close Legal Glossary"
              >
                ✕
              </button>
            </div>

            <p className="font-body text-xs text-[var(--muted)] mt-3 mb-4">
              Plain-language definitions for confusing terms commonly hidden in small print.
            </p>

            <input
              type="text"
              placeholder="Search legal terms (e.g. indemnity, damages, arbitration)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--bg)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--pen-blue)] text-[var(--fg)] placeholder:text-[var(--muted)] mb-4"
              aria-label="Search legal glossary terms"
            />

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filtered.map((item) => (
                <div
                  key={item.term}
                  className="paper-sheet rounded-sm p-3 border border-[var(--border)]"
                >
                  <h3 className="font-display font-semibold text-sm text-[var(--pen-blue)] mb-1">
                    {item.term}
                  </h3>
                  <p className="font-body text-xs text-[var(--fg)] leading-relaxed mb-2">
                    {item.definition}
                  </p>
                  <div className="bg-[var(--paper-dark)] p-2 rounded-sm text-[0.65rem] font-mono text-[var(--muted)]">
                    <strong>Practical Example:</strong> {item.example}
                  </div>
                  {item.riskNote && (
                    <div className="mt-2 text-[0.65rem] font-mono text-[var(--stamp-red)]">
                      ⚠ {item.riskNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
