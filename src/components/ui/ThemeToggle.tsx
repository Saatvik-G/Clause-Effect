"use client";
import { useEffect } from "react";
import { useAppState } from "@/lib/store/app-store";

export function ThemeToggle() {
  const { state, dispatch } = useAppState();
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "night") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", state.theme); } catch {}
  }, [state.theme]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as "day" | "night" | null;
      if (saved) dispatch({ type: "SET_THEME", theme: saved });
    } catch {}
  }, [dispatch]);
  const toggle = () => dispatch({ type: "SET_THEME", theme: state.theme === "day" ? "night" : "day" });
  return (
    <button onClick={toggle} aria-label={state.theme === "day" ? "Switch to night-shift theme" : "Switch to day theme"}
      className="flex items-center gap-1.5 font-mono text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--muted)]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {state.theme === "day" ? <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /> : <circle cx="12" cy="12" r="5" />}
      </svg>
      {state.theme === "day" ? "Night" : "Day"}
    </button>
  );
}
