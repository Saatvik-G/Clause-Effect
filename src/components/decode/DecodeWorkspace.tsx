"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/lib/store/app-store";
import type { Clause, ReadingLevel } from "@/lib/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Stamp } from "@/components/ui/Stamp";
import { RedStringOverlay } from "./RedStringOverlay";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { NegotiationHelper } from "./NegotiationHelper";
import { ContradictionDetector } from "./ContradictionDetector";
import { SigningChecklist } from "./SigningChecklist";
import { GlossaryDrawer } from "./GlossaryDrawer";

interface ClauseCardProps {
  clause: Clause;
  isSelected: boolean;
  onSelect: () => void;
  motionEnabled: boolean;
}

function ClauseCard({ clause, isSelected, onSelect, motionEnabled }: ClauseCardProps) {
  const riskColor = {
    low: "border-l-[var(--safe)]",
    medium: "border-l-[var(--caution)]",
    high: "border-l-[var(--stamp-red)]",
    unusual: "border-l-[var(--pen-blue)]",
  }[clause.risk];

  return (
    <motion.button
      onClick={onSelect}
      initial={motionEnabled ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      aria-pressed={isSelected}
      aria-label={`${clause.title} — ${clause.risk} risk clause`}
      className={`w-full text-left p-3 rounded-sm border-l-4 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--paper-dark)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)] ${riskColor} ${
        isSelected ? "ring-2 ring-[var(--pen-blue)] ring-offset-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-display font-semibold text-sm leading-tight text-[var(--fg)]">
          {clause.title}
        </span>
        <RiskBadge risk={clause.risk} size="sm" />
      </div>
      <p className="font-mono text-[0.65rem] text-[var(--muted)] uppercase tracking-wide">
        {clause.category}
      </p>
    </motion.button>
  );
}

interface EffectDrawerProps {
  clause: Clause;
  readingLevel: ReadingLevel;
  motionEnabled: boolean;
}

function EffectDrawer({ clause, readingLevel, motionEnabled }: EffectDrawerProps) {
  const plainText =
    readingLevel === "simple"
      ? clause.plainMeaning.simple
      : readingLevel === "lawyer-lite"
      ? clause.plainMeaning.lawyerLite
      : clause.plainMeaning.standard;

  const whoColor = {
    you: "text-[var(--safe)]",
    them: "text-[var(--stamp-red)]",
    both: "text-[var(--caution)]",
    unclear: "text-[var(--muted)]",
  }[clause.whoBenefits];

  const whoLabel = {
    you: "Benefits YOU",
    them: "Benefits THEM",
    both: "Benefits BOTH",
    unclear: "Unclear who benefits",
  }[clause.whoBenefits];

  return (
    <motion.div
      key={clause.id}
      initial={motionEnabled ? { opacity: 0, x: 20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Risk stamp */}
      <div className="flex items-center gap-3">
        <Stamp
          color={clause.risk === "high" ? "red" : clause.risk === "medium" ? "orange" : clause.risk === "unusual" ? "blue" : "green"}
          animate={motionEnabled}
          rotate={-2}
        >
          {clause.risk === "low" ? "FAIR" : clause.risk === "medium" ? "CAUTION" : clause.risk === "high" ? "HIGH RISK" : "UNUSUAL"}
        </Stamp>
        <span className={`font-mono text-xs font-bold ${whoColor}`} aria-label={whoLabel}>
          {whoLabel}
        </span>
        {!clause.verified && (
          <span className="font-mono text-[0.6rem] text-[var(--caution)] border border-[var(--caution)] px-1.5 py-0.5 rounded-sm">
            UNVERIFIED
          </span>
        )}
      </div>

      {/* Verbatim quote */}
      <div className="relative">
        <div
          className="absolute -left-3 top-0 bottom-0 w-0.5 rounded-full"
          style={{
            backgroundColor:
              clause.risk === "high"
                ? "var(--stamp-red)"
                : clause.risk === "medium"
                ? "var(--caution)"
                : clause.risk === "unusual"
                ? "var(--pen-blue)"
                : "var(--safe)",
          }}
          aria-hidden="true"
        />
        <blockquote className="font-body text-sm italic text-[var(--muted)] leading-relaxed pl-2">
          &ldquo;{clause.verbatimQuote.slice(0, 300)}
          {clause.verbatimQuote.length > 300 ? "…" : ""}&rdquo;
        </blockquote>
      </div>

      {/* Plain meaning + Read Aloud */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider">
            What this means
          </h4>
          <button
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(plainText);
                u.rate = 0.95;
                window.speechSynthesis.speak(u);
              }
            }}
            className="font-mono text-[0.6rem] text-[var(--pen-blue)] hover:underline flex items-center gap-1"
            title="Read plain meaning aloud"
            aria-label="Read plain meaning aloud"
          >
            <span aria-hidden="true">🔊</span> Read Aloud
          </button>
        </div>
        <motion.p
          key={readingLevel}
          initial={motionEnabled ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          className="font-body text-sm text-[var(--fg)] leading-relaxed"
        >
          {plainText}
        </motion.p>
      </div>

      {/* Why it matters */}
      <div>
        <h4 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
          Why it matters
        </h4>
        <p className="font-body text-sm text-[var(--fg)] leading-relaxed">
          {clause.whyItMatters}
        </p>
      </div>

      {/* IF→THEN effects */}
      {clause.ifThenEffects.length > 0 && (
        <div>
          <h4 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
            IF → THEN
          </h4>
          <div className="space-y-2">
            {clause.ifThenEffects.map((ift, i) => (
              <div key={i} className="bg-[var(--paper-dark)] rounded-sm p-2.5 text-xs">
                <span className="font-mono text-[var(--pen-blue)] font-bold">{ift.condition}</span>
                <br />
                <span className="font-body text-[var(--fg)]">{ift.consequence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counter-language */}
      {clause.negotiable && clause.counterLanguage && (
        <div className="border border-[var(--safe)]/40 rounded-sm p-3 bg-[var(--safe)]/5">
          <h4 className="font-mono text-[0.65rem] font-bold text-[var(--safe)] uppercase tracking-wider mb-1.5">
            Negotiable — suggested wording
          </h4>
          <p className="font-body text-xs text-[var(--fg)] italic leading-relaxed">
            {clause.counterLanguage}
          </p>
        </div>
      )}

      {/* Confidence */}
      <p className="font-mono text-[0.6rem] text-[var(--muted)]">
        Analysis confidence: {Math.round(clause.confidence * 100)}%
        {!clause.verified && " · ⚠ Quote could not be verified in source"}
      </p>
    </motion.div>
  );
}

interface ScoreGaugeProps {
  score: import("@/lib/types").FinePrintScore;
  motionEnabled: boolean;
}

function ScoreGauge({ score, motionEnabled }: ScoreGaugeProps) {
  const verdictColor = {
    "very-fair": "text-[var(--safe)]",
    fair: "text-[var(--safe)]",
    mixed: "text-[var(--caution)]",
    risky: "text-[var(--stamp-red)]",
    "very-risky": "text-[var(--stamp-red)]",
  }[score.verdict];

  const verdictLabel = {
    "very-fair": "VERY FAIR",
    fair: "FAIR",
    mixed: "MIXED",
    risky: "RISKY",
    "very-risky": "VERY RISKY",
  }[score.verdict];

  // Gauge: 0=risky(left), 100=fair(right)
  const angle = (score.total / 100) * 180 - 90; // -90 = far left, +90 = far right

  return (
    <div className="text-center">
      <h3 className="font-mono text-[0.65rem] font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
        Fine Print Score
      </h3>

      {/* SVG balance scale gauge */}
      <div className="flex justify-center mb-2" aria-hidden="true">
        <svg width="120" height="70" viewBox="0 0 120 70">
          {/* Arc background */}
          <path d="M 10 65 A 50 50 0 0 1 110 65" stroke="var(--border)" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Score arc */}
          <motion.path
            d="M 10 65 A 50 50 0 0 1 110 65"
            stroke={score.total >= 65 ? "var(--safe)" : score.total >= 45 ? "var(--caution)" : "var(--stamp-red)"}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="157"
            initial={{ strokeDashoffset: 157 }}
            animate={{ strokeDashoffset: 157 - (157 * score.total) / 100 }}
            transition={motionEnabled ? { duration: 1.2, ease: "easeOut", delay: 0.3 } : { duration: 0 }}
          />
          {/* Needle */}
          <motion.line
            x1="60" y1="65"
            x2={60 + 40 * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={65 + 40 * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke="var(--ink)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            style={{ transformOrigin: "60px 65px" }}
            transition={motionEnabled ? { duration: 1, ease: "easeOut", delay: 0.5 } : { duration: 0 }}
          />
          <circle cx="60" cy="65" r="4" fill="var(--ink)" />
          {/* Labels */}
          <text x="4" y="70" fontSize="8" fill="var(--stamp-red)" fontFamily="monospace">RISKY</text>
          <text x="82" y="70" fontSize="8" fill="var(--safe)" fontFamily="monospace">FAIR</text>
        </svg>
      </div>

      <div className="flex items-baseline justify-center gap-2">
        <span className="font-display font-bold text-3xl text-[var(--fg)]">{score.total}</span>
        <span className="font-mono text-xs text-[var(--muted)]">/ 100</span>
      </div>
      <div className={`font-mono text-xs font-bold tracking-wider mt-1 ${verdictColor}`}>
        {verdictLabel}
      </div>
    </div>
  );
}

export function DecodeWorkspace() {
  const { state, dispatch } = useAppState();
  const { analysis, selectedClauseId, readingLevel, motionEnabled } = state;

  if (!analysis) return null;

  const selectedClause = analysis.clauses.find((c) => c.id === selectedClauseId);

  const selectClause = (id: string) =>
    dispatch({ type: "SELECT_CLAUSE", clauseId: selectedClauseId === id ? null : id });

  const riskCounts = {
    high: analysis.clauses.filter((c) => c.risk === "high").length,
    unusual: analysis.clauses.filter((c) => c.risk === "unusual").length,
    medium: analysis.clauses.filter((c) => c.risk === "medium").length,
    low: analysis.clauses.filter((c) => c.risk === "low").length,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Key Facts corkboard strip */}
      <section
        aria-label="Key facts from the document"
        className="border-b border-[var(--border)] bg-[var(--paper-dark)] px-4 py-3 overflow-x-auto no-print"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-mono text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-widest">
              Key Facts
            </span>
            <div className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
          </div>
          <GlossaryDrawer />
        </div>
        <div className="flex gap-3 flex-wrap">
          {analysis.keyFacts.slice(0, 8).map((fact) => (
            <div
              key={fact.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-sm px-2.5 py-1.5 min-w-fit"
            >
              <span className="block font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-wide mb-0.5">
                {fact.label}
              </span>
              <span className="block font-body text-sm font-semibold text-[var(--fg)]">
                {fact.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Clause index */}
        <aside
          aria-label="Clause index"
          className="w-72 shrink-0 border-r border-[var(--border)] overflow-y-auto p-3 space-y-2"
        >
          {/* Risk summary */}
          <div className="flex gap-2 flex-wrap mb-3">
            {riskCounts.high > 0 && (
              <span className="font-mono text-[0.6rem] text-[var(--stamp-red)] font-bold">
                {riskCounts.high} HIGH
              </span>
            )}
            {riskCounts.unusual > 0 && (
              <span className="font-mono text-[0.6rem] text-[var(--pen-blue)] font-bold">
                {riskCounts.unusual} UNUSUAL
              </span>
            )}
            {riskCounts.medium > 0 && (
              <span className="font-mono text-[0.6rem] text-[var(--caution)] font-bold">
                {riskCounts.medium} MEDIUM
              </span>
            )}
          </div>

          {/* Reading level toggle */}
          <div className="flex gap-1 mb-3" role="group" aria-label="Reading level">
            {(["simple", "standard", "lawyer-lite"] as ReadingLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => dispatch({ type: "SET_READING_LEVEL", level: lvl })}
                aria-pressed={readingLevel === lvl}
                className={`flex-1 font-mono text-[0.6rem] uppercase tracking-wide py-1 px-1 rounded-sm border transition-colors ${
                  readingLevel === lvl
                    ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
                    : "text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]"
                }`}
              >
                {lvl === "lawyer-lite" ? "Lawyer" : lvl}
              </button>
            ))}
          </div>

          {/* Clause list */}
          <div className="space-y-2">
            {analysis.clauses.map((clause) => (
              <ClauseCard
                key={clause.id}
                clause={clause}
                isSelected={selectedClauseId === clause.id}
                onSelect={() => selectClause(clause.id)}
                motionEnabled={motionEnabled}
              />
            ))}
          </div>

          {/* Missing protections */}
          {analysis.missingProtections.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h3 className="font-mono text-[0.6rem] font-bold text-[var(--stamp-red)] uppercase tracking-wider mb-2">
                Missing Protections
              </h3>
              <div className="space-y-1.5">
                {analysis.missingProtections
                  .filter((p) => p.critical)
                  .map((p) => (
                    <div key={p.id} className="text-xs">
                      <span className="font-mono text-[var(--stamp-red)] font-bold">✕ </span>
                      <span className="font-body text-[var(--fg)]">{p.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* Center: Document view */}
        <main
          aria-label="Document analysis"
          className="flex-1 overflow-y-auto p-6"
        >
          {/* Score */}
          <div className="paper-sheet paper-texture rounded-sm p-6 mb-6 max-w-sm mx-auto">
            <ScoreGauge score={analysis.score} motionEnabled={motionEnabled} />
            {analysis.score.breakdown.slice(0, 3).map((item) => (
              <div key={item.category} className="flex items-center justify-between mt-2 text-xs">
                <span className="font-body text-[var(--muted)]">{item.notes.split(":")[0]}</span>
                <span className="font-mono text-[var(--stamp-red)] font-bold">-{Math.round(item.contribution)}</span>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {/* Red String Overlay */}
            <RedStringOverlay
              selectedClause={selectedClause ?? null}
              allClauses={analysis.clauses}
              motionEnabled={motionEnabled}
            />

            {/* Clause highlights on document */}
            <div
              className="paper-sheet paper-texture rounded-sm p-6 font-body text-sm leading-relaxed space-y-4"
              aria-label="Document with highlighted clauses"
            >
              <h2 className="font-display font-bold text-lg text-[var(--fg)] mb-4">
                {analysis.documentInfo.typeLabel}
              </h2>
              {analysis.clauses.map((clause) => (
                <motion.div
                  key={clause.id}
                  onClick={() => selectClause(clause.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${clause.title} — click to view analysis`}
                  onKeyDown={(e) => { if (e.key === "Enter") selectClause(clause.id); }}
                  className={`relative cursor-pointer rounded-sm p-3 transition-all ${
                    selectedClauseId === clause.id
                      ? "ring-2 ring-[var(--pen-blue)]"
                      : "hover:bg-[var(--paper-dark)]"
                  }`}
                >
                  {/* Highlighter sweep */}
                  <motion.div
                    className="absolute inset-0 rounded-sm pointer-events-none"
                    style={{
                      background: {
                        low: "rgba(35,162,109,0.12)",
                        medium: "rgba(240,138,36,0.12)",
                        high: "rgba(226,59,46,0.12)",
                        unusual: "rgba(35,64,232,0.10)",
                      }[clause.risk],
                      transformOrigin: "left center",
                    }}
                    initial={motionEnabled ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: clause.index * 0.08 }}
                    aria-hidden="true"
                  />
                  <div className="flex items-start gap-2 relative">
                    <RiskBadge risk={clause.risk} size="sm" className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-display font-semibold text-sm text-[var(--fg)]">{clause.title}</span>
                      <p className="font-body text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
                        {clause.verbatimQuote.slice(0, 120)}…
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* What-if Simulator */}
            <WhatIfSimulator
              analysis={analysis}
              onSelectClause={(cId) => selectClause(cId)}
            />

            {/* Negotiation Helper & Email Drafter */}
            <NegotiationHelper
              analysis={analysis}
              selectedClause={selectedClause}
            />

            {/* Contradiction Detector */}
            <ContradictionDetector analysis={analysis} />

            {/* Signing Readiness Checklist */}
            <SigningChecklist analysis={analysis} />
          </div>
        </main>

        {/* Right: Effect drawer */}
        <aside
          aria-label="Clause effect details"
          className="w-80 shrink-0 border-l border-[var(--border)] overflow-y-auto p-4"
        >
          <AnimatePresence mode="wait">
            {selectedClause ? (
              <motion.div
                key={selectedClause.id}
                initial={motionEnabled ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EffectDrawer
                  clause={selectedClause}
                  readingLevel={readingLevel}
                  motionEnabled={motionEnabled}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={motionEnabled ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="font-margin text-2xl text-[var(--muted)] mb-2" aria-hidden="true">
                  ← tap a clause
                </div>
                <p className="font-body text-sm text-[var(--muted)]">
                  Select any highlighted clause to see its plain-language meaning, risks, and what you can do about it.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
