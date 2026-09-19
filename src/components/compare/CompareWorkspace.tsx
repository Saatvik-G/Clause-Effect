"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/lib/store/app-store";
import type { CompareResult } from "@/lib/types";
import { Stamp } from "@/components/ui/Stamp";

const CHANGE_CHIP_STYLE = {
  added: "bg-[var(--safe)]/15 text-[var(--safe)] border-[var(--safe)]",
  removed: "bg-[var(--stamp-red)]/15 text-[var(--stamp-red)] border-[var(--stamp-red)]",
  changed: "bg-[var(--caution)]/15 text-[var(--caution)] border-[var(--caution)]",
  "shifted-toward-them": "bg-[var(--stamp-red)]/10 text-[var(--stamp-red)] border-[var(--stamp-red)]",
  "shifted-toward-you": "bg-[var(--safe)]/10 text-[var(--safe)] border-[var(--safe)]",
  unchanged: "bg-[var(--border)] text-[var(--muted)] border-[var(--border)]",
};

const CHANGE_CHIP_LABEL = {
  added: "ADDED",
  removed: "REMOVED",
  changed: "CHANGED",
  "shifted-toward-them": "SHIFTED → THEM",
  "shifted-toward-you": "SHIFTED → YOU",
  unchanged: "UNCHANGED",
};

interface DocumentSlotProps {
  label: string;
  onText: (text: string) => void;
  text: string;
}

function DocumentSlot({ label, onText, text }: DocumentSlotProps) {
  const [paste, setPaste] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/extract", { method: "POST", body: form });
    const data = await res.json();
    if (data.text) onText(data.text);
  }

  if (text) {
    return (
      <div className="paper-sheet paper-texture rounded-sm p-4 h-full min-h-[300px] relative">
        <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-widest block mb-2">{label}</span>
        <p className="font-body text-xs text-[var(--fg)] leading-relaxed line-clamp-[20] whitespace-pre-wrap">
          {text.slice(0, 1500)}…
        </p>
        <button
          onClick={() => onText("")}
          className="absolute top-3 right-3 font-mono text-[0.6rem] text-[var(--muted)] hover:text-[var(--stamp-red)] transition-colors"
          aria-label={`Remove ${label}`}
        >
          ✕ Remove
        </button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-[var(--border)] rounded-sm p-6 h-full min-h-[300px] flex flex-col gap-3">
      <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-widest">{label}</span>
      <div
        onClick={() => fileRef.current?.click()}
        role="button" tabIndex={0}
        className="flex-1 flex items-center justify-center cursor-pointer hover:bg-[var(--paper-dark)] rounded-sm transition-colors"
        onKeyDown={(e) => { if (e.key === "Enter") fileRef.current?.click(); }}
        aria-label={`Upload document for ${label}`}
      >
        <span className="font-mono text-xs text-[var(--pen-blue)] border border-[var(--pen-blue)] px-3 py-1.5 rounded-sm">
          Upload PDF / DOCX / TXT
        </span>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
      <div className="relative flex items-center gap-2">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="font-mono text-[0.6rem] text-[var(--muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      <textarea value={paste} onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste text here…"
        className="w-full h-24 p-2 text-xs font-body bg-[var(--surface)] border border-[var(--border)] rounded-sm resize-none focus:outline-none focus:border-[var(--pen-blue)] text-[var(--fg)] placeholder:text-[var(--muted)]"
        aria-label={`Paste text for ${label}`} />
      <button
        onClick={() => { if (paste.trim().length >= 50) onText(paste.trim()); }}
        disabled={paste.trim().length < 50}
        className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-3 py-1.5 rounded-sm disabled:opacity-40 hover:opacity-90"
      >Use this text</button>
    </div>
  );
}

import { TracingPaperOverlay } from "./TracingPaperOverlay";
import { DEMO_COMPARE_RESULT } from "@/lib/demo/samples";

export function CompareWorkspace() {
  const { state } = useAppState();
  const { motionEnabled } = state;
  const [textV1, setTextV1] = useState("");
  const [textV2, setTextV2] = useState("");
  const [result, setResult] = useState<CompareResult | null>(state.compareResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTracingPaper, setShowTracingPaper] = useState(false);

  async function loadSampleComparison() {
    setLoading(true);
    setError(null);
    try {
      const [res1, res2] = await Promise.all([
        fetch("/samples/rental-agreement.txt").then((r) => r.text()),
        fetch("/samples/rental-v2.txt").then((r) => r.text()),
      ]);
      setTextV1(res1);
      setTextV2(res2);
      setResult(DEMO_COMPARE_RESULT);
    } catch {
      setError("Failed to load sample files.");
    } finally {
      setLoading(false);
    }
  }

  async function runCompare() {
    if (!textV1 || !textV2) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textV1, textV2, clausesV1: [], clausesV2: [] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Comparison failed."); return; }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const verdictStampColor = {
    "better-for-you": "green",
    "worse-for-you": "red",
    neutral: "orange",
  } as const;

  return (
    <div className="flex flex-col h-full min-h-0 p-4 gap-4">
      {/* Sample Loader Header */}
      {!result && !textV1 && !textV2 && (
        <div className="bg-[var(--pen-blue)]/5 border border-[var(--pen-blue)]/30 rounded-sm p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs">
            <strong className="font-display text-[var(--fg)]">Want to test Compare instantly?</strong>
            <span className="font-body text-[var(--muted)] ml-1">
              Load our precomputed Rental Agreement (Draft 1 vs Draft 2).
            </span>
          </div>
          <button
            onClick={loadSampleComparison}
            disabled={loading}
            className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-2 rounded-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {loading ? "Loading..." : "Try Sample Comparison (v1 vs v2) →"}
          </button>
        </div>
      )}

      {/* Action bar if texts are loaded but comparison not run yet */}
      {!result && textV1 && textV2 && (
        <div className="flex items-center justify-between bg-[var(--paper-dark)] p-2 rounded-sm text-xs font-mono">
          <span className="text-[var(--muted)]">Two versions loaded for comparison</span>
          <button
            onClick={() => setShowTracingPaper(true)}
            className="text-[var(--pen-blue)] hover:underline flex items-center gap-1 font-bold"
          >
            <span>📑</span> Open Tracing Paper Overlay
          </button>
        </div>
      )}

      {/* Comparison active action bar */}
      {result && (
        <div className="flex items-center justify-between bg-[var(--paper-dark)] p-2.5 rounded-sm text-xs font-mono">
          <span className="text-[var(--muted)]">Comparing: <strong className="text-[var(--fg)]">Version 1 (Original) vs Version 2 (Revised)</strong></span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTracingPaper(true)}
              className="text-[var(--pen-blue)] hover:underline flex items-center gap-1 font-bold"
            >
              <span>📑</span> Tracing Paper Split View
            </button>
            <button
              onClick={() => { setResult(null); setTextV1(""); setTextV2(""); }}
              className="text-[var(--muted)] hover:text-[var(--stamp-red)] transition-colors"
            >
              ✕ Start New Comparison
            </button>
          </div>
        </div>
      )}

      {/* Document slots - only shown before comparison */}
      {!result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
          <DocumentSlot label="Version 1 (Original Draft)" onText={setTextV1} text={textV1} />
          <DocumentSlot label="Version 2 (Revised Draft)" onText={setTextV2} text={textV2} />
        </div>
      )}

      {/* Compare button */}
      {textV1 && textV2 && !result && (
        <div className="flex justify-center gap-3">
          <button
            onClick={runCompare}
            disabled={loading}
            className="font-display font-bold text-white bg-[var(--ink)] px-8 py-3 rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Comparing…" : "Compare these documents →"}
          </button>
          <button
            onClick={() => setShowTracingPaper(true)}
            className="font-mono text-xs font-bold text-[var(--pen-blue)] border border-[var(--pen-blue)] px-6 py-3 rounded-sm hover:bg-[var(--pen-blue)]/5 transition-colors"
          >
            Tracing Paper View 📑
          </button>
        </div>
      )}

      {showTracingPaper && (
        <TracingPaperOverlay
          textV1={textV1}
          textV2={textV2}
          onClose={() => setShowTracingPaper(false)}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-[var(--stamp-red)] font-mono text-center">{error}</p>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto space-y-4"
        >
          {/* Verdict stamp */}
          <div className="flex items-center justify-center gap-4 py-4 border-b border-[var(--border)]">
            <Stamp
              color={verdictStampColor[result.verdict.netEffect]}
              size="lg"
              animate={motionEnabled}
              rotate={-2}
            >
              {result.verdict.netEffect === "better-for-you"
                ? "BETTER FOR YOU"
                : result.verdict.netEffect === "worse-for-you"
                ? "WORSE FOR YOU"
                : "NEUTRAL"}
            </Stamp>
            <div className="max-w-lg">
              <p className="font-body text-sm text-[var(--fg)] leading-relaxed">
                {result.verdict.summary}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="font-mono text-[0.65rem] text-[var(--stamp-red)]">
                  {result.verdict.shiftsTowardThem} shifts toward them
                </span>
                <span className="font-mono text-[0.65rem] text-[var(--safe)]">
                  {result.verdict.shiftsTowardYou} shifts toward you
                </span>
              </div>
            </div>
          </div>

          {/* Diffs */}
          <div className="space-y-3">
            {result.diffs
              .filter((d) => d.changeType !== "unchanged")
              .map((diff) => (
                <motion.div
                  key={diff.id}
                  initial={motionEnabled ? { opacity: 0, x: -8 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 items-start paper-sheet rounded-sm p-3"
                >
                  <span
                    className={`shrink-0 font-mono text-[0.6rem] font-bold border px-1.5 py-0.5 rounded-sm ${
                      CHANGE_CHIP_STYLE[diff.changeType]
                    }`}
                    aria-label={`Change type: ${CHANGE_CHIP_LABEL[diff.changeType]}`}
                  >
                    {CHANGE_CHIP_LABEL[diff.changeType]}
                  </span>
                  <div>
                    <p className="font-body text-sm text-[var(--fg)] leading-relaxed">{diff.explanation}</p>
                    <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase tracking-wide">
                      {diff.significance} change
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>

          <button
            onClick={() => { setResult(null); setTextV1(""); setTextV2(""); }}
            className="font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] underline mx-auto block"
          >
            Start new comparison
          </button>
        </motion.div>
      )}
    </div>
  );
}
