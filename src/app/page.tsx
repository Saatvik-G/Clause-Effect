"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppProvider, useAppState } from "@/lib/store/app-store";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MotionToggle } from "@/components/ui/MotionToggle";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { DropZone } from "@/components/upload/DropZone";
import { DecodeWorkspace } from "@/components/decode/DecodeWorkspace";
import { AskPanel } from "@/components/decode/AskPanel";
import { CompareWorkspace } from "@/components/compare/CompareWorkspace";
import { NavigateWorkspace } from "@/components/navigate/NavigateWorkspace";
import { OCRModal } from "@/components/upload/OCRModal";
import { PIIPreviewModal } from "@/components/upload/PIIPreviewModal";
import { ShortcutsModal } from "@/components/ui/ShortcutsModal";
import { DEMO_RENTAL_ANALYSIS, DEMO_SAMPLES, loadDemoAnalysis } from "@/lib/demo/samples";
import { redactPII, type RedactionResult } from "@/lib/pipeline/redactor";
import { SUPPORTED_LANGUAGES, TRANSLATIONS, type LanguageCode } from "@/lib/i18n/translations";
import type { AnalysisResult, PipelineProgress } from "@/lib/types";

// ─── Marquee ticker data ──────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Auto-renewal clause — your lease restarts automatically unless you give 60 days notice",
  "Arbitrator appointed solely by landlord — you have no say in who decides your dispute",
  "IP assignment — everything you create belongs to your employer, including personal projects",
  "Unilateral change — company can modify terms without your consent",
  "Late fee ₹500/day — a 20-day delay costs ₹10,000 on top of rent",
  "No entry notice — landlord can walk in at any time without warning",
  "Perpetual NDA — confidentiality obligation never expires",
  "Acceleration clause — entire loan becomes due immediately on default",
  "Class action waiver — you give up the right to sue with others",
  "Data sold to third parties — your personal information is a product",
  "Kill fee on early exit — leaving project early costs 25% of remaining value",
  "Lock-in period — deposit fully forfeited if you leave in first 4 months",
];

// ─── Hero scroll animation — fictional contract ───────────────────────────────
const HERO_CLAUSES = [
  { legalese: "The Tenant shall forfeit the entire security deposit in the event of early termination prior to expiry.", plain: "You lose all your deposit if you leave early. That's potentially months of rent gone." },
  { legalese: "This Agreement shall automatically renew for successive terms unless notice is given 60 days prior.", plain: "It auto-renews every year. Miss the 60-day window and you're locked in for another year." },
  { legalese: "Employer retains all intellectual property rights in all work product, whether or not created on company time.", plain: "Your side projects are theirs too. Anything you build is company property." },
];

// ─── Folder tab component ─────────────────────────────────────────────────────
function FolderTabs() {
  const { state, dispatch } = useAppState();
  const tabs = [
    { id: "decode" as const, label: "DECODE", desc: "Understand any clause" },
    { id: "compare" as const, label: "COMPARE", desc: "See what changed" },
    { id: "navigate" as const, label: "NAVIGATE", desc: "What to do next" },
  ];

  return (
    <div className="flex gap-0 relative" role="tablist" aria-label="Document analysis modes">
      {tabs.map((tab, i) => {
        const isActive = state.mode === tab.id;
        return (
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => dispatch({ type: "SET_MODE", mode: tab.id })}
            style={{ zIndex: isActive ? 10 : 5 - i }}
            whileHover={{ y: -2 }}
            className={`relative px-6 py-3 font-mono text-xs font-bold tracking-widest uppercase transition-all focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)] ${
              isActive
                ? "bg-[var(--bg)] text-[var(--fg)] border-t-2 border-x border-[var(--border)] rounded-t-sm shadow-sm -mb-px"
                : "bg-[var(--paper-dark)] text-[var(--muted)] border-t border-x border-[var(--border)] rounded-t-sm hover:text-[var(--fg)] hover:bg-[var(--surface)] -mb-0"
            }`}
            aria-label={`${tab.label}: ${tab.desc}`}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-x-0 top-0 h-0.5 bg-[var(--pen-blue)] rounded-t-sm"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Landing hero ─────────────────────────────────────────────────────────────
function Hero({ onTrySample }: { onTrySample: () => void }) {
  const { state } = useAppState();
  const [heroClause, setHeroClause] = useState(0);

  return (
    <section
      aria-label="Clause & Effect hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      {/* Paper grain background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" opacity="0.03" />
        </svg>
      </div>

      {/* Giant headline */}
      <motion.div
        initial={state.motionEnabled ? { opacity: 0, y: 30 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-4xl mb-12"
      >
        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl text-[var(--fg)] leading-none mb-4">
          Read what you&apos;re signing.
        </h1>
        <p className="font-body text-lg md:text-xl text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
          AI-powered document analysis for tenants, employees, freelancers, and anyone about to sign something they can&apos;t fully read.
        </p>
        <p className="font-mono text-xs text-[var(--muted)] mt-3 uppercase tracking-wider">
          Decode &middot; Compare &middot; Navigate — in under 60 seconds
        </p>
      </motion.div>

      {/* Animated contract sheet */}
      <motion.div
        initial={state.motionEnabled ? { opacity: 0, y: 40, rotate: -1 } : false}
        animate={{ opacity: 1, y: 0, rotate: -0.5 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="paper-sheet paper-texture rounded-sm p-6 max-w-lg w-full mb-10 relative"
        style={{ boxShadow: "0 8px 32px rgba(21,18,14,0.15), 0 2px 8px rgba(21,18,14,0.1)" }}
        aria-label="Example contract clause analysis"
      >
        <div className="font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">
          Example · Rental Agreement · Clause 4
        </div>

        {/* Cycling clauses */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroClause}
            initial={state.motionEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Legalese → highlighted → plain */}
            <div className="relative mb-4">
              <motion.div
                className="absolute inset-0 rounded-sm"
                initial={state.motionEnabled ? { scaleX: 0 } : false}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ transformOrigin: "left center", background: "var(--highlight)", opacity: 0.35 }}
                aria-hidden="true"
              />
              <blockquote className="relative font-body text-xs italic text-[var(--muted)] p-2 leading-relaxed">
                &ldquo;{HERO_CLAUSES[heroClause].legalese}&rdquo;
              </blockquote>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[0.6rem] font-bold text-[var(--pen-blue)] shrink-0 mt-0.5">PLAIN ENGLISH</span>
              <p className="font-body text-sm text-[var(--fg)] leading-relaxed">
                {HERO_CLAUSES[heroClause].plain}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Clause navigation */}
        <div className="flex justify-center gap-2 mt-4">
          {HERO_CLAUSES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroClause(i)}
              aria-label={`Show example clause ${i + 1}`}
              aria-pressed={heroClause === i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === heroClause ? "bg-[var(--pen-blue)]" : "bg-[var(--border)]"}`}
            />
          ))}
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={state.motionEnabled ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 items-center mb-16"
      >
        <button
          onClick={() => document.getElementById("app-shell")?.scrollIntoView({ behavior: "smooth" })}
          className="font-display font-bold text-base text-white bg-[var(--ink)] px-8 py-3.5 rounded-sm hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)]"
          aria-label="Upload your document to start analysis"
        >
          Upload your document →
        </button>
        <button
          onClick={onTrySample}
          className="font-mono text-xs font-bold text-[var(--pen-blue)] border border-[var(--pen-blue)] px-6 py-3 rounded-sm hover:bg-[var(--pen-blue)]/5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)]"
          aria-label="Try a sample document without uploading"
        >
          Try a sample (no upload needed)
        </button>
      </motion.div>

      {/* Marquee ticker */}
      <div
        className="w-full border-y border-[var(--border)] bg-[var(--paper-dark)] py-2.5 overflow-hidden"
        aria-label="Common hidden clause patterns"
        role="marquee"
      >
        <div className="marquee-track whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-block font-mono text-xs text-[var(--muted)] px-6">
              <span className="text-[var(--stamp-red)] mr-2" aria-hidden="true">⚑</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Sample picker ────────────────────────────────────────────────────────────
function SamplePicker({ onSelect, onClose }: { onSelect: (id: string) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-0 bg-[var(--ink)]/40 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-label="Choose a sample document"
      aria-modal="true"
    >
      <div className="paper-sheet paper-texture rounded-sm p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-[var(--fg)]">Choose a sample</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--fg)] text-xl">✕</button>
        </div>
        <p className="font-body text-sm text-[var(--muted)] mb-4">
          All samples are fictional documents. Analysis uses precomputed data — no API key needed.
        </p>
        <div className="space-y-2">
          {DEMO_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => { onSelect(sample.id); onClose(); }}
              className="w-full text-left p-3 border border-[var(--border)] rounded-sm hover:border-[var(--pen-blue)] hover:bg-[var(--pen-blue)]/5 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)]"
            >
              <div className="font-display font-semibold text-sm text-[var(--fg)]">{sample.label}</div>
              <div className="font-mono text-[0.65rem] text-[var(--muted)] mt-0.5">{sample.description}</div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main app shell ───────────────────────────────────────────────────────────
function AppShell() {
  const { state, dispatch, setProgress, forgetEverything } = useAppState();
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [redactPiiEnabled, setRedactPiiEnabled] = useState(true);
  const [pendingRedaction, setPendingRedaction] = useState<RedactionResult | null>(null);
  const [isDyslexic, setIsDyslexic] = useState(false);

  const t = TRANSLATIONS[state.language] ?? TRANSLATIONS.en;

  const loadSample = useCallback(async (sampleId: string) => {
    dispatch({ type: "SET_DEMO", isDemo: true });
    const analysis = await loadDemoAnalysis(sampleId);
    dispatch({ type: "SET_ANALYSIS", analysis });
    dispatch({ type: "SET_MODE", mode: "decode" });
    document.getElementById("app-shell")?.scrollIntoView({ behavior: "smooth" });
  }, [dispatch]);

  const analyseText = useCallback(async (text: string) => {
    setProgress({ stage: "analysing", message: "Analysing clauses with AI…", percent: 55 });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "NO_API_KEY") {
          // Fall back to demo
          dispatch({ type: "SET_DEMO", isDemo: true });
          dispatch({ type: "SET_ANALYSIS", analysis: DEMO_RENTAL_ANALYSIS });
          dispatch({ type: "SET_ERROR", error: "No API key configured — showing demo data instead. Add GEMINI_API_KEY to .env.local to analyse your own documents." });
        } else {
          dispatch({ type: "SET_ERROR", error: data.message ?? "Analysis failed." });
        }
        return;
      }

      setProgress({ stage: "scoring", message: "Computing Fine Print Score…", percent: 85 });
      setProgress({ stage: "done", message: "Analysis complete!", percent: 100 });
      dispatch({ type: "SET_DEMO", isDemo: false });
      dispatch({ type: "SET_ANALYSIS", analysis: data as AnalysisResult });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error. Check your connection and try again." });
    }
  }, [dispatch, setProgress]);

  const handleInputText = useCallback((rawText: string) => {
    if (redactPiiEnabled) {
      const red = redactPII(rawText);
      if (red.count > 0) {
        setPendingRedaction(red);
        return;
      }
    }
    analyseText(rawText);
  }, [redactPiiEnabled, analyseText]);

  const analyseFile = useCallback(async (file: File) => {
    setProgress({ stage: "reading", message: `Reading ${file.name}…`, percent: 10 });

    try {
      const form = new FormData();
      form.append("file", file);
      setProgress({ stage: "normalising", message: "Extracting text from document…", percent: 25 });

      const extractRes = await fetch("/api/extract", { method: "POST", body: form });
      const extractData = await extractRes.json();

      if (!extractRes.ok) {
        dispatch({ type: "SET_ERROR", error: extractData.message ?? "Failed to read file." });
        return;
      }

      setProgress({ stage: "classifying", message: "Identifying document type…", percent: 40 });
      handleInputText(extractData.text);
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to read the file. Please try again." });
    }
  }, [dispatch, setProgress, handleInputText]);

  const hasAnalysis = !!state.analysis;

  return (
    <div
      className={`min-h-screen flex flex-col bg-[var(--bg)] text-[var(--fg)] ${
        !state.motionEnabled ? "motion-disabled" : ""
      } ${isDyslexic ? "font-sans tracking-wide" : ""}`}
    >
      {/* Legal notice banner */}
      <InfoBanner />

      {/* Machine Translation Notice when non-English */}
      {state.language !== "en" && (
        <div className="bg-[var(--pen-blue)]/10 border-b border-[var(--pen-blue)]/30 py-1.5 px-4 text-center font-mono text-xs text-[var(--pen-blue)]">
          🌐 {t.machineTranslatedNotice}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[var(--pen-blue)] rounded-sm" aria-label="Clause & Effect home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="2" width="14" height="18" rx="1" stroke="var(--fg)" strokeWidth="1.5" fill="var(--paper)" />
              <line x1="6" y1="7" x2="14" y2="7" stroke="var(--highlight)" strokeWidth="3" />
              <line x1="6" y1="11" x2="12" y2="11" stroke="var(--fg)" strokeWidth="1.5" opacity="0.4" />
              <line x1="6" y1="14" x2="14" y2="14" stroke="var(--fg)" strokeWidth="1.5" opacity="0.4" />
              <circle cx="19" cy="19" r="4" fill="var(--stamp-red)" />
              <path d="M17.5 19l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-display font-bold text-base text-[var(--fg)]">Clause & Effect</span>
          </a>
          {state.isDemo && <SampleBadge />}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Selector */}
          <select
            value={state.language}
            onChange={(e) => dispatch({ type: "SET_LANGUAGE", language: e.target.value as LanguageCode })}
            className="font-mono text-xs bg-[var(--surface)] text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 focus:outline-none focus:border-[var(--pen-blue)] cursor-pointer"
            aria-label="Language selection"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel} ({lang.label})
              </option>
            ))}
          </select>

          {/* Dyslexia font toggle */}
          <button
            onClick={() => setIsDyslexic((prev) => !prev)}
            className={`font-mono text-xs px-2 py-1 rounded border transition-colors ${
              isDyslexic
                ? "bg-[var(--pen-blue)] text-white border-[var(--pen-blue)]"
                : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
            title="Toggle dyslexia-friendly sans-serif font"
            aria-label="Toggle dyslexia-friendly font"
          >
            Aa
          </button>

          {/* Keyboard shortcuts trigger */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="font-mono text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
            title="View keyboard shortcuts (Press ?)"
            aria-label="View keyboard shortcuts"
          >
            ?
          </button>

          <MotionToggle />
          <ThemeToggle />

          {hasAnalysis && (
            <button
              onClick={forgetEverything}
              className="font-mono text-xs text-[var(--muted)] hover:text-[var(--stamp-red)] transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--stamp-red)]"
              aria-label="Clear all document data from this session"
            >
              {t.forgetEverything}
            </button>
          )}
        </div>
      </header>

      {/* Landing hero (only before analysis) */}
      {!hasAnalysis && (
        <Hero onTrySample={() => setShowSamplePicker(true)} />
      )}

      {/* App shell */}
      <div id="app-shell" className={`flex flex-col ${hasAnalysis ? "flex-1 min-h-0" : "px-4 py-8"}`}>
        {/* Upload / progress */}
        {!hasAnalysis && (
          <div className="max-w-2xl mx-auto w-full mb-8">
            <DropZone
              onFile={analyseFile}
              onText={handleInputText}
              disabled={state.progress.stage !== "idle" && state.progress.stage !== "done" && state.progress.stage !== "error"}
            />

            {/* Quick Upload Options Bar */}
            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <label className="flex items-center gap-1.5 cursor-pointer text-[var(--muted)] hover:text-[var(--fg)]">
                <input
                  type="checkbox"
                  checked={redactPiiEnabled}
                  onChange={(e) => setRedactPiiEnabled(e.target.checked)}
                  className="accent-[var(--pen-blue)] cursor-pointer"
                />
                <span>🛡️ {t.redactPii} (On by default)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowOCRModal(true)}
                className="text-[var(--pen-blue)] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>📷</span> {t.ocrUpload}
              </button>
            </div>

            <div className="mt-4">
              <ProgressBar progress={state.progress} />
            </div>
            {state.error && (
              <motion.p
                role="alert"
                initial={state.motionEnabled ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-[var(--stamp-red)] font-mono bg-[var(--stamp-red)]/10 border border-[var(--stamp-red)]/30 rounded-sm px-3 py-2"
              >
                {state.error}
              </motion.p>
            )}
          </div>
        )}

        {/* Workspace */}
        {hasAnalysis && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Progress bar */}
            {state.progress.stage !== "idle" && state.progress.stage !== "done" && (
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <ProgressBar progress={state.progress} />
              </div>
            )}

            {/* Error banner */}
            {state.error && (
              <div className="px-4 py-2 border-b border-[var(--stamp-red)]/30 bg-[var(--stamp-red)]/5">
                <p role="alert" className="text-xs text-[var(--stamp-red)] font-mono">{state.error}</p>
              </div>
            )}

            {/* Folder tabs */}
            <nav className="px-4 pt-3 border-b border-[var(--border)] bg-[var(--paper-dark)]" aria-label="Workspace modes">
              <FolderTabs />
            </nav>

            {/* Mode workspaces */}
            <AnimatePresence mode="wait">
              {state.mode === "decode" && (
                <motion.div
                  key="decode"
                  initial={state.motionEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col flex-1 min-h-0"
                >
                  <DecodeWorkspace />
                  <AskPanel />
                </motion.div>
              )}
              {state.mode === "compare" && (
                <motion.div
                  key="compare"
                  initial={state.motionEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <CompareWorkspace />
                </motion.div>
              )}
              {state.mode === "navigate" && (
                <motion.div
                  key="navigate"
                  initial={state.motionEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <NavigateWorkspace />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-mono text-[0.65rem] text-[var(--muted)]">
          Clause & Effect · Information, not legal advice · No documents stored server-side
        </span>
        <span className="font-mono text-[0.65rem] text-[var(--muted)]">
          Built for AI for Legal Assistance & Access challenge
        </span>
      </footer>

      {/* Sample picker modal */}
      <AnimatePresence>
        {showSamplePicker && (
          <SamplePicker
            onSelect={loadSample}
            onClose={() => setShowSamplePicker(false)}
          />
        )}
      </AnimatePresence>

      {/* OCR Scan Modal */}
      <OCRModal
        isOpen={showOCRModal}
        onClose={() => setShowOCRModal(false)}
        onExtractedText={(text) => handleInputText(text)}
      />

      {/* PII Redaction Preview Modal */}
      <PIIPreviewModal
        isOpen={!!pendingRedaction}
        onClose={() => setPendingRedaction(null)}
        redactionResult={pendingRedaction}
        onConfirm={() => {
          if (pendingRedaction) {
            analyseText(pendingRedaction.redactedText);
            setPendingRedaction(null);
          }
        }}
      />

      {/* Keyboard Shortcuts Overlay */}
      <ShortcutsModal />
    </div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
