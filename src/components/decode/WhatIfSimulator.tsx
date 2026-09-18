"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisResult } from "@/lib/types";
import { simulateScenario } from "@/lib/simulator/what-if";

interface WhatIfSimulatorProps {
  analysis: AnalysisResult;
  onSelectClause?: (clauseId: string) => void;
}

export function WhatIfSimulator({ analysis, onSelectClause }: WhatIfSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<"early_exit" | "late_rent">("early_exit");
  const [month, setMonth] = useState<number>(3);
  const [daysLate, setDaysLate] = useState<number>(14);

  const scenarioResult = simulateScenario(selectedScenario, analysis, {
    month,
    daysLate,
  });

  return (
    <div className="paper-sheet rounded-sm p-4 border border-[var(--border)] bg-[var(--surface)] mt-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">🧮</span>
          <h3 className="font-display font-bold text-sm text-[var(--fg)]">
            What-If Simulator
          </h3>
        </div>
        <span className="font-mono text-[0.6rem] text-[var(--pen-blue)] bg-[var(--pen-blue)]/10 px-2 py-0.5 rounded-sm">
          Interactive Scenario Modeler
        </span>
      </div>

      {/* Scenario Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedScenario("early_exit")}
          className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors ${
            selectedScenario === "early_exit"
              ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          Early Departure (Month {month})
        </button>
        <button
          onClick={() => setSelectedScenario("late_rent")}
          className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors ${
            selectedScenario === "late_rent"
              ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          Delayed Payment ({daysLate} days)
        </button>
      </div>

      {/* Interactive Controls */}
      <div className="bg-[var(--paper-dark)] p-3 rounded-sm mb-4">
        {selectedScenario === "early_exit" ? (
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Exit Month: <strong>Month {month}</strong> of 11</span>
              <span className={month <= 4 ? "text-[var(--stamp-red)] font-bold" : "text-[var(--safe)] font-bold"}>
                {month <= 4 ? "⚠ WITHIN 4-MONTH LOCK-IN" : "✓ AFTER LOCK-IN"}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={11}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full accent-[var(--pen-blue)] cursor-pointer"
              aria-label="Exit month slider"
            />
            <div className="flex justify-between text-[0.6rem] font-mono text-[var(--muted)] mt-1">
              <span>Month 1</span>
              <span>Month 4 (Lock-in ends)</span>
              <span>Month 11</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>Days Delayed: <strong>{daysLate} Days Late</strong></span>
              <span className={daysLate > 30 ? "text-[var(--stamp-red)] font-bold" : "text-[var(--caution)] font-bold"}>
                {daysLate > 30 ? "⚠ TERMINATION RISK (>30d)" : `₹${daysLate * 500} Penalty`}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={45}
              value={daysLate}
              onChange={(e) => setDaysLate(Number(e.target.value))}
              className="w-full accent-[var(--pen-blue)] cursor-pointer"
              aria-label="Days late slider"
            />
            <div className="flex justify-between text-[0.6rem] font-mono text-[var(--muted)] mt-1">
              <span>1 day</span>
              <span>15 days</span>
              <span>30 days (Auto-termination threshold)</span>
              <span>45 days</span>
            </div>
          </div>
        )}
      </div>

      {/* Calculation Results Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedScenario}-${month}-${daysLate}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="space-y-3"
        >
          <div className="border border-[var(--border)] rounded-sm p-3 bg-[var(--surface)]">
            <h4 className="font-display font-semibold text-xs text-[var(--fg)] mb-1">
              {scenarioResult.title}
            </h4>
            <p className="font-body text-xs text-[var(--muted)] mb-3">
              {scenarioResult.summary}
            </p>

            {/* Arithmetic Breakdown */}
            <div className="space-y-1.5 border-t border-[var(--border)] pt-2 text-xs">
              {scenarioResult.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-body text-[var(--fg)]">{item.item}</span>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-[var(--fg)]">{item.amount}</span>
                    <span className="block font-mono text-[0.55rem] text-[var(--muted)]">{item.note}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Net Impact Banner */}
            <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--muted)]">Net Impact</span>
              <span className="font-mono text-xs font-bold text-[var(--pen-blue)]">
                {scenarioResult.netImpact}
              </span>
            </div>

            {scenarioResult.warning && (
              <div className="mt-2 p-2 bg-[var(--stamp-red)]/10 border border-[var(--stamp-red)]/30 rounded-sm text-[0.65rem] font-mono text-[var(--stamp-red)]">
                {scenarioResult.warning}
              </div>
            )}
          </div>

          {/* Clause Citations */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase">Governing clauses:</span>
            {scenarioResult.relevantClauses.map((cId) => (
              <button
                key={cId}
                onClick={() => onSelectClause?.(cId)}
                className="font-mono text-[0.6rem] text-[var(--pen-blue)] border border-[var(--pen-blue)]/40 px-1.5 py-0.5 rounded-sm hover:bg-[var(--pen-blue)]/10 transition-colors"
              >
                {cId} ↗
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
