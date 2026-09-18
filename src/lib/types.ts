// Core type definitions for Clause & Effect
// All types used across the application

export type DocumentType =
  | "rental"
  | "employment"
  | "nda"
  | "loan"
  | "freelance"
  | "terms"
  | "insurance"
  | "other";

export type RiskLevel = "low" | "medium" | "high" | "unusual";

export type ReadingLevel = "simple" | "standard" | "lawyer-lite";

export interface Clause {
  id: string;
  index: number;
  title: string;
  verbatimQuote: string;
  charStart: number;
  charEnd: number;
  category: string;
  risk: RiskLevel;
  plainMeaning: {
    simple: string;
    standard: string;
    lawyerLite: string;
  };
  whyItMatters: string;
  whoBenefits: "you" | "them" | "both" | "unclear";
  ifThenEffects: Array<{ condition: string; consequence: string }>;
  negotiable: boolean;
  counterLanguage?: string;
  confidence: number; // 0-1
  verified: boolean;
  relatedClauseIds: string[];
  unverifiedFields?: string[];
}

export interface KeyFact {
  id: string;
  label: string;
  value: string;
  clauseId: string;
  verified: boolean;
  category:
    | "party"
    | "date"
    | "amount"
    | "notice"
    | "term"
    | "penalty"
    | "renewal"
    | "law"
    | "forum";
}

export interface MissingProtection {
  id: string;
  name: string;
  description: string;
  critical: boolean;
}

export interface FinePrintScore {
  total: number; // 0-100, higher = fairer
  breakdown: Array<{
    category: string;
    weight: number;
    rawScore: number;
    contribution: number;
    notes: string;
  }>;
  verdict: "very-risky" | "risky" | "mixed" | "fair" | "very-fair";
}

export interface DocumentInfo {
  type: DocumentType;
  typeLabel: string;
  language: string;
  jurisdiction: string;
  parties: { you?: string; them?: string; others?: string[] };
  detectedAt: number;
}

export interface AnalysisResult {
  id: string;
  documentInfo: DocumentInfo;
  clauses: Clause[];
  keyFacts: KeyFact[];
  score: FinePrintScore;
  missingProtections: MissingProtection[];
  rawText: string;
  contentHash: string;
  analyzedAt: number;
  isDemo?: boolean;
  redactedFields?: number;
}

// Compare types
export type ChangeType =
  | "added"
  | "removed"
  | "changed"
  | "shifted-toward-them"
  | "shifted-toward-you"
  | "unchanged";

export interface ClauseDiff {
  id: string;
  changeType: ChangeType;
  clauseV1?: Clause;
  clauseV2?: Clause;
  explanation: string;
  significance: "minor" | "moderate" | "major";
}

export interface CompareResult {
  diffs: ClauseDiff[];
  verdict: {
    netEffect: "better-for-you" | "worse-for-you" | "neutral";
    summary: string;
    majorChanges: number;
    shiftsTowardThem: number;
    shiftsTowardYou: number;
  };
  analyzedAt: number;
}

// Navigate types
export interface ActionTicket {
  id: string;
  what: string;
  by: string | null; // date string or null
  who: string;
  carry: string[];
  clauseId?: string;
  priority: "urgent" | "important" | "normal";
}

export interface NavigateResult {
  redFlags: string[];
  actionTickets: ActionTicket[];
  questionsBeforeSigning: string[];
  questionsForLawyer: string[];
  deadlines: Array<{ label: string; date: string | null; clauseId?: string }>;
  analyzedAt: number;
}

// Progress stages
export type PipelineStage =
  | "idle"
  | "reading"
  | "normalising"
  | "segmenting"
  | "classifying"
  | "analysing"
  | "verifying"
  | "scoring"
  | "done"
  | "error";

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  percent: number;
}

// UI state
export interface AppState {
  mode: "decode" | "compare" | "navigate";
  analysis: AnalysisResult | null;
  compareResult: CompareResult | null;
  navigateResult: NavigateResult | null;
  progress: PipelineProgress;
  error: string | null;
  selectedClauseId: string | null;
  readingLevel: ReadingLevel;
  motionEnabled: boolean;
  theme: "day" | "night";
  language: "en" | "hi" | "kn" | "ta" | "te";
  isDemo: boolean;
}
