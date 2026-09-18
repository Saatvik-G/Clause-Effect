"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppState } from "@/lib/store/app-store";
import type { AskResponse } from "@/lib/ai/schemas";

export function AskPanel() {
  const { state } = useAppState();
  const { analysis, motionEnabled } = state;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAsk() {
    if (!analysis || !question.trim()) return;
    if (question.length > 500) {
      setError("Question too long — max 500 characters.");
      return;
    }

    setStreaming(true);
    setStreamText("");
    setAnswer(null);
    setError(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          text: analysis.rawText,
          clauses: analysis.clauses.map((c) => ({
            id: c.id,
            title: c.title,
            verbatimQuote: c.verbatimQuote,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Failed to get answer.");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const json = line.slice(6);
          try {
            const parsed = JSON.parse(json);
            if (parsed.token) setStreamText((prev) => prev + parsed.token);
            if (parsed.done && parsed.result) {
              setAnswer(parsed.result);
              setStreamText("");
            }
            if (parsed.error) setError(parsed.error);
          } catch {}
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setStreaming(false);
    }
  }

  const relevantClauses = answer?.clauseIds
    .map((id) => analysis?.clauses.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-widest">
            Ask about this document
          </span>
          <span className="font-mono text-[0.55rem] text-[var(--muted)] border border-[var(--border)] px-1 py-0.5 rounded-sm">
            Grounded in document only
          </span>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !streaming) handleAsk(); }}
            placeholder="e.g. What is the notice period? Can I sublet? What happens if I miss a payment?"
            maxLength={500}
            disabled={streaming || !analysis}
            className="flex-1 px-3 py-2 text-sm font-body bg-[var(--bg)] border border-[var(--border)] rounded-sm focus:outline-none focus:border-[var(--pen-blue)] text-[var(--fg)] placeholder:text-[var(--muted)] disabled:opacity-50"
            aria-label="Ask a question about this document"
          />
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                const SpeechRecognition =
                  (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                  (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

                if (!SpeechRecognition) {
                  setError("Speech recognition is not supported in this browser. Please type your question.");
                  return;
                }

                try {
                  const recognition = new SpeechRecognition();
                  recognition.lang = "en-US";
                  recognition.interimResults = false;
                  recognition.onstart = () => setError("Listening... Speak your question now.");
                  recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setQuestion(transcript);
                    setError(null);
                  };
                  recognition.onerror = () => setError("Could not capture audio. Please try again or type.");
                  recognition.start();
                } catch {
                  setError("Could not access microphone.");
                }
              }
            }}
            className="font-mono text-xs px-2.5 py-2 rounded-sm border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--pen-blue)] text-[var(--fg)] transition-colors"
            title="Speak your question using microphone"
            aria-label="Voice input"
          >
            🎤
          </button>
          <button
            onClick={handleAsk}
            disabled={streaming || !analysis || !question.trim()}
            className="font-mono text-xs font-bold text-white bg-[var(--pen-blue)] px-4 py-2 rounded-sm disabled:opacity-40 hover:opacity-90 whitespace-nowrap"
            aria-label="Submit question"
          >
            {streaming ? "Thinking…" : "Ask →"}
          </button>
        </div>

        {/* Streaming text */}
        <AnimatePresence>
          {streaming && streamText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 font-body text-sm text-[var(--fg)] leading-relaxed"
            >
              {streamText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-0.5 h-4 bg-[var(--pen-blue)] ml-0.5 align-middle"
                aria-hidden="true"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final answer */}
        <AnimatePresence>
          {answer && !streaming && (
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-2"
            >
              <div className={`font-body text-sm text-[var(--fg)] leading-relaxed p-3 rounded-sm ${
                answer.notAddressed
                  ? "bg-[var(--caution)]/10 border border-[var(--caution)]/30"
                  : "bg-[var(--surface)] border border-[var(--border)]"
              }`}>
                {answer.notAddressed && (
                  <span className="font-mono text-[0.6rem] font-bold text-[var(--caution)] block mb-1">
                    NOT IN DOCUMENT
                  </span>
                )}
                {answer.answer}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6rem] text-[var(--muted)]">
                  Confidence: {Math.round(answer.confidence * 100)}%
                </span>
                {relevantClauses && relevantClauses.length > 0 && (
                  <span className="font-mono text-[0.6rem] text-[var(--muted)]">
                    From: {relevantClauses.map((c) => c?.title).join(", ")}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-2 text-xs text-[var(--stamp-red)] font-mono">{error}</p>
        )}
      </div>
    </div>
  );
}
