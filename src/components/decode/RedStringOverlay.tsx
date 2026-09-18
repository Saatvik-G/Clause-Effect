"use client";

import { motion } from "framer-motion";
import type { Clause } from "@/lib/types";

interface RedStringOverlayProps {
  selectedClause: Clause | null;
  allClauses: Clause[];
  motionEnabled: boolean;
}

export function RedStringOverlay({ selectedClause, allClauses, motionEnabled }: RedStringOverlayProps) {
  if (!selectedClause || selectedClause.relatedClauseIds.length === 0) return null;

  const relatedClauses = allClauses.filter((c) =>
    selectedClause.relatedClauseIds.includes(c.id)
  );

  if (relatedClauses.length === 0) return null;

  return (
    <div className="relative py-2 px-3 bg-[#E23B2E]/5 border border-[#E23B2E]/30 rounded-sm mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        {/* Red String Pin Icon */}
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#E23B2E] shadow-sm animate-pulse" aria-hidden="true" />
        <span className="font-mono text-[0.65rem] font-bold text-[#E23B2E] uppercase tracking-wider">
          Red-String Connection Link:
        </span>
      </div>

      <p className="font-body text-xs text-[var(--fg)] mb-2">
        <strong>{selectedClause.title}</strong> is inextricably linked to:
      </p>

      <div className="flex flex-wrap gap-2 items-center">
        {relatedClauses.map((rc, idx) => (
          <div
            key={rc.id}
            className="flex items-center gap-1.5 bg-[var(--surface)] border border-[#E23B2E]/40 px-2 py-1 rounded-sm text-xs"
          >
            {/* Red string line connector SVG */}
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
              <motion.path
                d="M 2 6 Q 12 1 22 6"
                stroke="#E23B2E"
                strokeWidth="2"
                strokeLinecap="round"
                initial={motionEnabled ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              />
            </svg>
            <span className="font-display font-semibold text-xs text-[var(--fg)]">
              {rc.title}
            </span>
            <span className="font-mono text-[0.6rem] text-[var(--muted)] uppercase">
              ({rc.category})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
