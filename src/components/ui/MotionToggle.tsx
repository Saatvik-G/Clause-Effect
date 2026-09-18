"use client";
import { useEffect } from "react";
import { useAppState } from "@/lib/store/app-store";

export function MotionToggle() {
  const { state, dispatch } = useAppState();
  useEffect(() => {
    try {
      const saved = localStorage.getItem("motion");
      if (saved !== null) dispatch({ type: "SET_MOTION", enabled: saved === "true" });
    } catch {}
  }, [dispatch]);
  const toggle = () => {
    const next = !state.motionEnabled;
    dispatch({ type: "SET_MOTION", enabled: next });
    try { localStorage.setItem("motion", String(next)); } catch {}
  };
  return (
    <button onClick={toggle} aria-label={state.motionEnabled ? "Disable animations" : "Enable animations"}
      className="flex items-center gap-1.5 font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--muted)]">
      {state.motionEnabled ? "Motion ON" : "Motion OFF"}
    </button>
  );
}
