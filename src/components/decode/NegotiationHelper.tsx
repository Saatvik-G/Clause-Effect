"use client";

import { useState } from "react";
import type { Clause, AnalysisResult } from "@/lib/types";

interface NegotiationHelperProps {
  analysis: AnalysisResult;
  selectedClause?: Clause;
}

export function NegotiationHelper({ analysis, selectedClause }: NegotiationHelperProps) {
  const [tone, setTone] = useState<"friendly" | "firm">("friendly");
  const [copied, setCopied] = useState(false);

  const negotiableClauses = analysis.clauses.filter((c) => c.negotiable);
  const targetClause = selectedClause?.negotiable ? selectedClause : negotiableClauses[0];

  const counterPartyName = analysis.documentInfo.parties.them ?? "the other party";
  const docTypeLabel = analysis.documentInfo.typeLabel;

  const emailSubject =
    tone === "friendly"
      ? `Discussion regarding terms in the draft ${docTypeLabel}`
      : `Proposed amendments to the draft ${docTypeLabel} prior to signing`;

  const emailBody =
    tone === "friendly"
      ? `Dear ${counterPartyName},

Thank you very much for sharing the draft ${docTypeLabel}. I am excited about moving forward and truly appreciate your time and consideration.

While reviewing the agreement, I noticed a couple of clauses that I was hoping we could make a quick mutual adjustment to before signing:

${targetClause ? `• ${targetClause.title}:
  Current language: "${targetClause.verbatimQuote.slice(0, 140)}..."
  Proposed language: ${targetClause.counterLanguage ?? "Could we adjust this to standard industry terms?"}` : "• Deposit & notice terms: Standard 30-day notice and 2-month deposit equivalent."}

Please let me know if these small adjustments work for you. Looking forward to completing the formalities and getting started!

Warm regards,
${analysis.documentInfo.parties.you ?? "Signer"}`
      : `Dear ${counterPartyName},

I have reviewed the draft ${docTypeLabel} in detail. In order to proceed with signature, there are key clauses that require alignment with standard commercial practices:

${targetClause ? `1. ${targetClause.title}:
   Current stipulation: "${targetClause.verbatimQuote.slice(0, 140)}..."
   Required amendment: ${targetClause.counterLanguage ?? "Substitution with mutual notice and capped liabilities."}` : "1. Notice & Termination provisions require parity between both parties."}

Please review the proposed adjustment above and let me know if an updated draft can be circulated for signature.

Sincerely,
${analysis.documentInfo.parties.you ?? "Signer"}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="paper-sheet rounded-sm p-4 border border-[var(--border)] bg-[var(--surface)] mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">✍️</span>
          <h3 className="font-display font-bold text-sm text-[var(--fg)]">
            Negotiation Helper & Email Drafter
          </h3>
        </div>
        <span className="font-mono text-[0.6rem] text-[var(--safe)] bg-[var(--safe)]/10 px-2 py-0.5 rounded-sm">
          {negotiableClauses.length} Negotiable Points Identified
        </span>
      </div>

      <p className="font-body text-xs text-[var(--muted)] mb-3">
        Generate professional counter-language and a ready-to-send draft email requesting fairer terms without confrontation.
      </p>

      {/* Tone Switcher */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[0.65rem] text-[var(--muted)] uppercase">Tone:</span>
        <button
          onClick={() => setTone("friendly")}
          className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
            tone === "friendly"
              ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          🤝 Friendly & Collaborative
        </button>
        <button
          onClick={() => setTone("firm")}
          className={`font-mono text-xs px-2.5 py-1 rounded-sm border transition-colors ${
            tone === "firm"
              ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          ⚖️ Firm & Professional
        </button>
      </div>

      {/* Email Preview Box */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-sm p-3 font-mono text-xs text-[var(--fg)] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
        <div className="text-[var(--muted)] pb-2 mb-2 border-b border-[var(--border)]">
          <strong>Subject:</strong> {emailSubject}
        </div>
        {emailBody}
      </div>

      {/* Copy CTA */}
      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[0.6rem] text-[var(--muted)]">
          Editable before sending to {counterPartyName}
        </span>
        <button
          onClick={handleCopy}
          className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-2 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          {copied ? "✓ Copied to Clipboard!" : "Copy Email Draft"}
        </button>
      </div>
    </div>
  );
}
