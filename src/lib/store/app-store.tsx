"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import type { AppState, AnalysisResult, CompareResult, NavigateResult, PipelineProgress, ReadingLevel } from "@/lib/types";

// ─── Initial State ───────────────────────────────────────────────────────────

const initialProgress: PipelineProgress = {
  stage: "idle",
  message: "",
  percent: 0,
};

const initialState: AppState = {
  mode: "decode",
  analysis: null,
  compareResult: null,
  navigateResult: null,
  progress: initialProgress,
  error: null,
  selectedClauseId: null,
  readingLevel: "standard",
  motionEnabled: true,
  theme: "day",
  language: "en",
  isDemo: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_MODE"; mode: AppState["mode"] }
  | { type: "SET_ANALYSIS"; analysis: AnalysisResult }
  | { type: "SET_COMPARE_RESULT"; result: CompareResult }
  | { type: "SET_NAVIGATE_RESULT"; result: NavigateResult }
  | { type: "SET_PROGRESS"; progress: PipelineProgress }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SELECT_CLAUSE"; clauseId: string | null }
  | { type: "SET_READING_LEVEL"; level: ReadingLevel }
  | { type: "SET_MOTION"; enabled: boolean }
  | { type: "SET_THEME"; theme: AppState["theme"] }
  | { type: "SET_LANGUAGE"; language: AppState["language"] }
  | { type: "SET_DEMO"; isDemo: boolean }
  | { type: "FORGET_EVERYTHING" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode, selectedClauseId: null };
    case "SET_ANALYSIS":
      return { ...state, analysis: action.analysis, error: null };
    case "SET_COMPARE_RESULT":
      return { ...state, compareResult: action.result };
    case "SET_NAVIGATE_RESULT":
      return { ...state, navigateResult: action.result };
    case "SET_PROGRESS":
      return { ...state, progress: action.progress };
    case "SET_ERROR":
      return { ...state, error: action.error, progress: initialProgress };
    case "SELECT_CLAUSE":
      return { ...state, selectedClauseId: action.clauseId };
    case "SET_READING_LEVEL":
      return { ...state, readingLevel: action.level };
    case "SET_MOTION":
      return { ...state, motionEnabled: action.enabled };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "SET_LANGUAGE":
      return { ...state, language: action.language };
    case "SET_DEMO":
      return { ...state, isDemo: action.isDemo };
    case "FORGET_EVERYTHING":
      return {
        ...initialState,
        // Preserve preferences
        motionEnabled: state.motionEnabled,
        theme: state.theme,
        language: state.language,
        readingLevel: state.readingLevel,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  setProgress: (progress: PipelineProgress) => void;
  forgetEverything: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setProgress = useCallback(
    (progress: PipelineProgress) => dispatch({ type: "SET_PROGRESS", progress }),
    []
  );

  const forgetEverything = useCallback(() => {
    dispatch({ type: "FORGET_EVERYTHING" });
    // Clear session storage (cached analyses)
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, setProgress, forgetEverything }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used inside AppProvider");
  return ctx;
}
