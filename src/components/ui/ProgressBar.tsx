"use client";
import { motion } from "framer-motion";
import type { PipelineProgress } from "@/lib/types";

interface ProgressBarProps { progress: PipelineProgress; }

export function ProgressBar({ progress }: ProgressBarProps) {
  if (progress.stage === "idle" || progress.stage === "done") return null;
  return (
    <div className="w-full" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} aria-label={progress.message}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-[var(--muted)] tracking-wide">{progress.message}</span>
        <span className="text-xs font-mono text-[var(--muted)]">{progress.percent}%</span>
      </div>
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div className="h-full bg-[var(--pen-blue)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>
    </div>
  );
}
