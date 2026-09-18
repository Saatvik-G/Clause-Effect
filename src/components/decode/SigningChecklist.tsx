"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { AnalysisResult } from "@/lib/types";
import { Stamp } from "@/components/ui/Stamp";

interface ChecklistItem {
  id: string;
  label: string;
  detail: string;
  checked: boolean;
}

export function SigningChecklist({ analysis }: { analysis: AnalysisResult }) {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "check-1",
      label: "All Parties & Legal Names Verified",
      detail: `Counterparty '${analysis.documentInfo.parties.them ?? "The other party"}' confirmed with valid identification or CIN number.`,
      checked: true,
    },
    {
      id: "check-2",
      label: "All Money Amounts & Bank Wire Details Checked",
      detail: "Exact figures for deposit, fees, penalties, and payment schedules matched against agreed offer.",
      checked: false,
    },
    {
      id: "check-3",
      label: "Notice Periods & Deadlines Marked on Calendar",
      detail: "60-day or 30-day non-renewal warning dates added to personal phone calendar.",
      checked: false,
    },
    {
      id: "check-4",
      label: "High-Risk & Unusual Clauses Discussed or Countered",
      detail: "Raised objections or requested counter-language on clauses that solely benefit the other party.",
      checked: false,
    },
    {
      id: "check-5",
      label: "Pre-Inspection or Deliverable Scope Documented",
      detail: "Condition of premises or definition of milestone deliverables documented in writing/photos.",
      checked: false,
    },
    {
      id: "check-6",
      label: "Exit Strategy & Termination Rights Understood",
      detail: "Clear understanding of total penalty or lost deposit if forced to exit early due to emergencies.",
      checked: true,
    },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const isAllComplete = completedCount === items.length;
  const percent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="paper-sheet rounded-sm p-4 border border-[var(--border)] bg-[var(--surface)] mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">📋</span>
          <h3 className="font-display font-bold text-sm text-[var(--fg)]">
            Signing-Readiness Checklist
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-[var(--muted)]">
          {completedCount}/{items.length} Ready ({percent}%)
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-4">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ${
            isAllComplete ? "bg-[var(--safe)]" : "bg-[var(--pen-blue)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Interactive items */}
      <div className="space-y-2 mb-4">
        {items.map((it) => (
          <label
            key={it.id}
            className={`flex items-start gap-3 p-2.5 rounded-sm border cursor-pointer transition-colors ${
              it.checked
                ? "bg-[var(--safe)]/5 border-[var(--safe)]/40 text-[var(--fg)]"
                : "bg-[var(--paper-dark)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            <input
              type="checkbox"
              checked={it.checked}
              onChange={() => toggleItem(it.id)}
              className="mt-0.5 accent-[var(--safe)] cursor-pointer"
            />
            <div className="text-xs">
              <span className={`font-display font-semibold block ${it.checked ? "text-[var(--fg)]" : ""}`}>
                {it.label}
              </span>
              <span className="font-body text-[0.65rem] text-[var(--muted)] block mt-0.5">
                {it.detail}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Dynamic Rubber Stamp Slam */}
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <span className="font-mono text-[0.65rem] text-[var(--muted)] uppercase">
          Readiness Verdict:
        </span>
        <Stamp
          color={isAllComplete ? "green" : "red"}
          size="md"
          animate={true}
          rotate={isAllComplete ? -3 : 4}
        >
          {isAllComplete ? "READY TO SIGN" : "DO NOT SIGN YET — REVIEW PENDING"}
        </Stamp>
      </div>
    </div>
  );
}
