"use client";

import { useEffect, useState, useCallback } from "react";

interface ShortcutsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ShortcutsModal({ isOpen: controlledIsOpen, onClose: controlledOnClose }: ShortcutsModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledOnClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        if (controlledIsOpen !== undefined) {
          if (isOpen && controlledOnClose) controlledOnClose();
        } else {
          setInternalIsOpen((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [controlledIsOpen, controlledOnClose, handleClose, isOpen]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "1", desc: "Switch to DECODE workspace" },
    { key: "2", desc: "Switch to COMPARE workspace" },
    { key: "3", desc: "Switch to NAVIGATE workspace" },
    { key: "j / k", desc: "Select next / previous clause card" },
    { key: "r", desc: "Read aloud currently selected clause" },
    { key: "f", desc: "Forget everything (clear session state)" },
    { key: "Esc", desc: "Deselect clause / close modal" },
    { key: "?", desc: "Toggle this keyboard shortcuts cheat-sheet" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--ink)]/50 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-label="Keyboard Shortcuts"
      aria-modal="true"
    >
      <div className="paper-sheet paper-texture rounded-sm p-6 max-w-md w-full border-2 border-[var(--border)] shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">⌨️</span>
            <h2 className="font-display font-bold text-base text-[var(--fg)]">
              Keyboard Navigation
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="font-mono text-sm text-[var(--muted)] hover:text-[var(--fg)] px-2 py-1"
            aria-label="Close shortcuts overlay"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs py-1">
              <span className="font-body text-[var(--fg)]">{s.desc}</span>
              <kbd className="font-mono font-bold text-[0.65rem] bg-[var(--paper-dark)] border border-[var(--border)] px-2 py-0.5 rounded shadow-xs text-[var(--pen-blue)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[var(--border)] text-center">
          <span className="font-mono text-[0.65rem] text-[var(--muted)]">
            Press <kbd className="font-bold">Esc</kbd> or <kbd className="font-bold">?</kbd> to dismiss
          </span>
        </div>
      </div>
    </div>
  );
}
