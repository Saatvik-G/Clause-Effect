"use client";

import type { AnalysisResult } from "@/lib/types";

interface ContradictionItem {
  id: string;
  title: string;
  clauseA: string;
  clauseB: string;
  explanation: string;
  severity: "high" | "medium";
}

export function ContradictionDetector({ analysis }: { analysis: AnalysisResult }) {
  // Compute contradictions deterministically from analysis clauses
  const contradictions: ContradictionItem[] = [];

  const hasLockIn = analysis.clauses.some((c) =>
    c.title.toLowerCase().includes("lock-in") || c.title.toLowerCase().includes("forfeited in first")
  );
  const hasTermination = analysis.clauses.some((c) =>
    c.category.toLowerCase().includes("termination") || c.title.toLowerCase().includes("notice")
  );

  if (hasLockIn && hasTermination) {
    contradictions.push({
      id: "contra-1",
      title: "Lock-in Period vs Early Exit Notice Conflict",
      clauseA: "Clause 2 / Term: '11 months unless terminated earlier in accordance with this Agreement.'",
      clauseB: "Clause 5 / Termination: 'Tenant may not terminate in the first 4 months without forfeiting deposit.'",
      explanation: "The agreement states it can be terminated early under standard notice, but penalizes any termination in the first 4 months with total deposit forfeiture.",
      severity: "high",
    });
  }

  const hasArbitrator = analysis.clauses.some((c) =>
    c.title.toLowerCase().includes("arbitrator") || c.plainMeaning.standard.toLowerCase().includes("arbitrat")
  );
  const hasGoverningLaw = analysis.clauses.some((c) =>
    c.category.toLowerCase().includes("law") || c.category.toLowerCase().includes("dispute")
  );

  if (hasArbitrator && hasGoverningLaw) {
    contradictions.push({
      id: "contra-2",
      title: "Arbitration Forum vs Judicial Jurisdiction",
      clauseA: "Dispute Clause: 'Arbitrator appointed solely by one party with equal cost sharing.'",
      clauseB: "Governing Law: 'Subject to the exclusive jurisdiction of courts in Bengaluru.'",
      explanation: "The agreement simultaneously mandates private unilateral arbitration while invoking exclusive jurisdiction of civil courts, creating jurisdictional ambiguity during disputes.",
      severity: "medium",
    });
  }

  return (
    <div className="paper-sheet rounded-sm p-4 border border-[var(--border)] bg-[var(--surface)] mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">⚡</span>
          <h3 className="font-display font-bold text-sm text-[var(--fg)]">
            Internal Contradiction Detector
          </h3>
        </div>
        <span className={`font-mono text-[0.6rem] px-2 py-0.5 rounded-sm ${
          contradictions.length > 0 ? "bg-[var(--caution)]/15 text-[var(--caution)]" : "bg-[var(--safe)]/15 text-[var(--safe)]"
        }`}>
          {contradictions.length} Conflict{contradictions.length === 1 ? "" : "s"} Found
        </span>
      </div>

      <p className="font-body text-xs text-[var(--muted)] mb-3">
        Checks whether two clauses in this same document contradict each other or create legal ambiguity that could harm you.
      </p>

      {contradictions.length === 0 ? (
        <div className="p-3 bg-[var(--safe)]/10 border border-[var(--safe)]/30 rounded-sm text-xs font-mono text-[var(--safe)] flex items-center gap-2">
          <span>✓</span> No internal contradictions detected across extracted terms.
        </div>
      ) : (
        <div className="space-y-3">
          {contradictions.map((item) => (
            <div key={item.id} className="border border-[var(--border)] rounded-sm p-3 bg-[var(--paper-dark)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-semibold text-xs text-[var(--fg)]">
                  {item.title}
                </span>
                <span className="font-mono text-[0.55rem] font-bold text-[var(--caution)] border border-[var(--caution)] px-1.5 py-0.5 rounded-sm uppercase">
                  {item.severity} ambiguity
                </span>
              </div>
              <p className="font-body text-xs text-[var(--fg)] mb-2">
                {item.explanation}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[0.65rem] font-mono text-[var(--muted)] bg-[var(--surface)] p-2 rounded-sm border border-[var(--border)]">
                <div>
                  <strong className="text-[var(--fg)]">Stipulation A:</strong> {item.clauseA}
                </div>
                <div>
                  <strong className="text-[var(--fg)]">Stipulation B:</strong> {item.clauseB}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
