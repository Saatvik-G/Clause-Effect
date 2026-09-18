"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/lib/store/app-store";
import type { NavigateResult, ActionTicket } from "@/lib/types";
import { DEMO_RENTAL_NAVIGATE } from "@/lib/demo/samples";
import { generateICS, downloadICSFile } from "@/lib/utils/ics";
import indiaHelp from "../../../data/legal-help/india.json";

const PRIORITY_STYLE = {
  urgent: "border-[var(--stamp-red)] bg-[var(--stamp-red)]/8",
  important: "border-[var(--caution)] bg-[var(--caution)]/8",
  normal: "border-[var(--border)] bg-[var(--surface)]",
};

const PRIORITY_LABEL = {
  urgent: { text: "URGENT", color: "text-[var(--stamp-red)]" },
  important: { text: "IMPORTANT", color: "text-[var(--caution)]" },
  normal: { text: "ACTION", color: "text-[var(--muted)]" },
};

function ActionTicketCard({ ticket, index, motionEnabled }: { ticket: ActionTicket; index: number; motionEnabled: boolean }) {
  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`border rounded-sm p-4 ${PRIORITY_STYLE[ticket.priority]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`font-mono text-[0.6rem] font-bold tracking-widest ${PRIORITY_LABEL[ticket.priority].color}`}>
          {PRIORITY_LABEL[ticket.priority].text}
        </span>
        {ticket.by && (
          <span className="font-mono text-[0.6rem] text-[var(--muted)] bg-[var(--paper-dark)] px-1.5 py-0.5 rounded-sm">
            By: {ticket.by}
          </span>
        )}
      </div>
      <p className="font-body font-semibold text-sm text-[var(--fg)] mb-2">{ticket.what}</p>
      {ticket.who && (
        <p className="font-mono text-xs text-[var(--muted)]">Contact: {ticket.who}</p>
      )}
      {ticket.carry.length > 0 && (
        <div className="mt-2">
          <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-wide">Bring / prepare:</span>
          <ul className="mt-1 space-y-0.5">
            {ticket.carry.map((item, i) => (
              <li key={i} className="font-body text-xs text-[var(--fg)] flex gap-1.5">
                <span aria-hidden="true" className="text-[var(--muted)]">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export function NavigateWorkspace() {
  const { state } = useAppState();
  const { analysis, navigateResult: stateNav, motionEnabled, isDemo } = state;
  const [result, setResult] = useState<NavigateResult | null>(
    isDemo ? DEMO_RENTAL_NAVIGATE : stateNav
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"actions" | "questions" | "help">("actions");

  useEffect(() => {
    if (isDemo && !result) setResult(DEMO_RENTAL_NAVIGATE);
  }, [isDemo, result]);

  async function loadNavigate() {
    if (!analysis) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/navigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: analysis.rawText,
          docType: analysis.documentInfo.type,
          clauses: analysis.clauses,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Failed to generate navigation guide."); return; }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!analysis && !result) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <div>
          <p className="font-body text-[var(--muted)] mb-4">Upload and decode a document first to get your navigation guide.</p>
          <p className="font-mono text-xs text-[var(--muted)]">Or try the rental agreement sample →</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-4">
          <p className="font-body text-sm text-[var(--fg)]">Ready to generate your navigation guide for this document.</p>
          {error && <p role="alert" className="text-sm text-[var(--stamp-red)] font-mono">{error}</p>}
          <button
            onClick={loadNavigate}
            disabled={loading}
            className="font-display font-bold text-white bg-[var(--ink)] px-8 py-3 rounded-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating guide…" : "Generate navigation guide →"}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "actions" as const, label: "Action Tickets", count: result.actionTickets.length },
    { id: "questions" as const, label: "Questions", count: result.questionsBeforeSigning.length + result.questionsForLawyer.length },
    { id: "help" as const, label: "Free Legal Help", count: (indiaHelp as { organisations: unknown[] }).organisations.length },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Red flags */}
      {result.redFlags.length > 0 && (
        <section aria-label="Red flags" className="border-b border-[var(--border)] bg-[var(--stamp-red)]/5 px-4 py-3">
          <h2 className="font-mono text-[0.65rem] font-bold text-[var(--stamp-red)] uppercase tracking-wider mb-2">
            ⚑ Red Flags ({result.redFlags.length})
          </h2>
          <div className="space-y-1">
            {result.redFlags.slice(0, 4).map((flag, i) => (
              <p key={i} className="font-body text-xs text-[var(--fg)] flex gap-2">
                <span className="text-[var(--stamp-red)] shrink-0" aria-hidden="true">—</span>
                {flag}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Deadlines strip */}
      {result.deadlines.filter((d) => d.date).length > 0 && (
        <section aria-label="Key deadlines" className="border-b border-[var(--border)] bg-[var(--paper-dark)] px-4 py-2 overflow-x-auto">
          <div className="flex gap-4 items-center">
            <span className="font-mono text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-widest shrink-0">Deadlines</span>
            {result.deadlines.filter((d) => d.date).map((d, i) => (
              <div key={i} className="shrink-0 bg-[var(--surface)] border border-[var(--border)] rounded-sm px-2.5 py-1">
                <span className="block font-mono text-[0.6rem] text-[var(--muted)]">{d.label}</span>
                <span className="block font-body text-xs font-semibold text-[var(--fg)]">{d.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Toolbar */}
      <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-2 flex items-center justify-between flex-wrap gap-2 no-print">
        <span className="font-mono text-[0.65rem] text-[var(--muted)]">
          Export Actions & Summary:
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const events = result.deadlines
                .filter((d) => d.date)
                .map((d) => ({
                  title: d.label,
                  description: "Deadline extracted by Clause & Effect legal assistant.",
                  dateStr: d.date as string,
                }));
              const icsContent = generateICS(events);
              downloadICSFile("document-deadlines.ics", icsContent);
            }}
            className="font-mono text-xs px-2.5 py-1 rounded-sm border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--pen-blue)] hover:text-[var(--pen-blue)] transition-colors flex items-center gap-1"
            title="Download iCalendar file"
          >
            <span>📅</span> Add to Calendar (.ics)
          </button>
          <button
            onClick={async () => {
              const text = `*Clause & Effect — Document Summary*\n\n*Top Red Flags:*\n${result.redFlags.slice(0, 3).map((f) => `• ${f}`).join("\n")}\n\n*Immediate Actions:*\n${result.actionTickets.slice(0, 3).map((t) => `• ${t.what} (By: ${t.by ?? "ASAP"})`).join("\n")}\n\n_Generated for awareness — Information, not legal advice._`;
              await navigator.clipboard.writeText(text);
              alert("WhatsApp summary copied to clipboard!");
            }}
            className="font-mono text-xs px-2.5 py-1 rounded-sm border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--safe)] hover:text-[var(--safe)] transition-colors flex items-center gap-1"
            title="Copy formatted summary to share on WhatsApp"
          >
            <span>💬</span> Copy WhatsApp Summary
          </button>
          <button
            onClick={() => window.print()}
            className="font-mono text-xs px-2.5 py-1 rounded-sm border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--fg)] transition-colors flex items-center gap-1"
            title="Print one-page fine print report or save as PDF"
          >
            <span>🖨️</span> Print / PDF Report
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)]" role="tablist" aria-label="Navigation sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[var(--pen-blue)] text-[var(--pen-blue)] bg-[var(--pen-blue)]/5"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {tab.label}{" "}
            <span className="ml-1 text-[0.6rem]">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === "actions" && (
            <motion.div key="actions" initial={motionEnabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="space-y-3">
              {result.actionTickets.map((ticket, i) => (
                <ActionTicketCard key={ticket.id} ticket={ticket} index={i} motionEnabled={motionEnabled} />
              ))}
            </motion.div>
          )}

          {activeTab === "questions" && (
            <motion.div key="questions" initial={motionEnabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
                  Ask before signing
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  {result.questionsBeforeSigning.map((q, i) => (
                    <li key={i} className="font-body text-sm text-[var(--fg)] leading-relaxed">{q}</li>
                  ))}
                </ol>
              </div>
              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
                  Questions for a lawyer
                </h3>
                <ol className="space-y-2 list-decimal list-inside">
                  {result.questionsForLawyer.map((q, i) => (
                    <li key={i} className="font-body text-sm text-[var(--fg)] leading-relaxed">{q}</li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}

          {activeTab === "help" && (
            <motion.div key="help" initial={motionEnabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-[var(--caution)]/10 border border-[var(--caution)]/30 rounded-sm p-3 text-xs font-mono text-[var(--caution)]">
                Verify before relying: Always confirm contact details and eligibility directly with each organisation. This list is for awareness only.
              </div>
              {(indiaHelp as { organisations: Array<{ id: string; name: string; description: string; eligibility: string; website: string; helpline: string }> }).organisations.map((org) => (
                <div key={org.id} className="paper-sheet rounded-sm p-4">
                  <h4 className="font-display font-semibold text-sm text-[var(--fg)] mb-1">{org.name}</h4>
                  <p className="font-body text-xs text-[var(--muted)] mb-2">{org.description}</p>
                  <p className="font-mono text-[0.6rem] text-[var(--fg)]">Eligibility: {org.eligibility}</p>
                  <div className="flex gap-3 mt-2">
                    <a href={org.website} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-[0.65rem] text-[var(--pen-blue)] hover:underline"
                      aria-label={`Visit ${org.name} website (opens in new tab)`}>
                      Website ↗
                    </a>
                    <span className="font-mono text-[0.65rem] text-[var(--fg)]">Helpline: {org.helpline}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
