"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface TracingPaperOverlayProps {
  textV1: string;
  textV2: string;
  onClose: () => void;
}

export function TracingPaperOverlay({ textV1, textV2, onClose }: TracingPaperOverlayProps) {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100 percent
  const [opacity, setOpacity] = useState(85); // 0 to 100 percent

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--ink)]/60 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-label="Tracing Paper Difference Overlay"
      aria-modal="true"
    >
      <div className="paper-sheet paper-texture rounded-sm p-6 max-w-4xl w-full border-2 border-[var(--border)] shadow-2xl h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">📑</span>
            <div>
              <h2 className="font-display font-bold text-base text-[var(--fg)]">
                Tracing Paper Split Comparison
              </h2>
              <span className="font-mono text-[0.65rem] text-[var(--muted)]">
                Drag the divider or adjust transparency to reveal revisions between drafts
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-sm text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1"
            aria-label="Close Tracing Paper"
          >
            ✕ Close
          </button>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-4 bg-[var(--paper-dark)] p-2.5 rounded-sm mb-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[var(--muted)]">Tracing Split:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="w-48 accent-[var(--pen-blue)] cursor-pointer"
              aria-label="Tracing paper split slider"
            />
            <span className="text-[var(--fg)] font-bold">{sliderPos}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)]">Paper Opacity:</span>
            <input
              type="range"
              min={20}
              max={100}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-32 accent-[var(--pen-blue)] cursor-pointer"
              aria-label="Tracing paper opacity slider"
            />
            <span className="text-[var(--fg)] font-bold">{opacity}%</span>
          </div>
        </div>

        {/* Split View Container */}
        <div className="relative flex-1 border border-[var(--border)] rounded-sm overflow-hidden bg-[var(--paper)]">
          {/* Base Layer: Version 1 */}
          <div className="absolute inset-0 p-6 overflow-y-auto font-body text-xs leading-relaxed text-[var(--fg)]">
            <div className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--stamp-red)] font-bold mb-2">
              UNDERLAY: Version 1 (Original Draft)
            </div>
            <div className="whitespace-pre-wrap">{textV1}</div>
          </div>

          {/* Tracing Paper Overlay: Version 2 clipped by slider */}
          <div
            className="absolute inset-y-0 right-0 overflow-y-auto font-body text-xs leading-relaxed border-l-2 border-[var(--pen-blue)] shadow-xl transition-all"
            style={{
              left: `${sliderPos}%`,
              backgroundColor: `rgba(243, 237, 224, ${opacity / 100})`,
              backdropFilter: "blur(0.5px)",
            }}
          >
            <div className="p-6">
              <div className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--safe)] font-bold mb-2">
                OVERLAY: Version 2 (Revised Draft)
              </div>
              <div className="whitespace-pre-wrap">{textV2}</div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-[0.65rem] font-mono text-[var(--muted)] mt-2">
          <span>Left of divider: Version 1 &nbsp;|&nbsp; Right of divider: Version 2</span>
          <span>Press <strong>Esc</strong> to close</span>
        </div>
      </div>
    </div>
  );
}
