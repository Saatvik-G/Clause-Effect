import { z } from "zod";

// ─── Sub-schemas ────────────────────────────────────────────────────────────

export const RiskLevelSchema = z.enum(["low", "medium", "high", "unusual"]);

export const WhoBenefitsSchema = z.enum(["you", "them", "both", "unclear"]);

export const DocumentTypeSchema = z.enum([
  "rental",
  "employment",
  "nda",
  "loan",
  "freelance",
  "terms",
  "insurance",
  "other",
]);

export const IfThenSchema = z.object({
  condition: z.string().max(300),
  consequence: z.string().max(300),
});

export const PlainMeaningSchema = z.object({
  simple: z.string().max(400),
  standard: z.string().max(600),
  lawyerLite: z.string().max(800),
});

// ─── Clause schema (LLM → validated) ────────────────────────────────────────

export const ClauseAnalysisSchema = z.object({
  id: z.string().regex(/^clause-\d+$/),
  title: z.string().max(100),
  verbatimQuote: z.string().max(2000),
  category: z.string().max(60),
  risk: RiskLevelSchema,
  plainMeaning: PlainMeaningSchema,
  whyItMatters: z.string().max(400),
  whoBenefits: WhoBenefitsSchema,
  ifThenEffects: z.array(IfThenSchema).max(5),
  negotiable: z.boolean(),
  counterLanguage: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1),
  relatedClauseIds: z.array(z.string()).max(5),
});

export type ClauseAnalysisInput = z.infer<typeof ClauseAnalysisSchema>;

// ─── Document info schema ────────────────────────────────────────────────────

export const DocumentInfoSchema = z.object({
  type: DocumentTypeSchema,
  typeLabel: z.string().max(60),
  language: z.string().max(40),
  jurisdiction: z.string().max(60),
  parties: z.object({
    you: z.string().max(100).optional(),
    them: z.string().max(100).optional(),
    others: z.array(z.string().max(100)).optional(),
  }),
});

// ─── Key fact schema ─────────────────────────────────────────────────────────

export const KeyFactSchema = z.object({
  id: z.string(),
  label: z.string().max(80),
  value: z.string().max(200),
  clauseId: z.string(),
  category: z.enum([
    "party",
    "date",
    "amount",
    "notice",
    "term",
    "penalty",
    "renewal",
    "law",
    "forum",
  ]),
});

export const KeyFactsResponseSchema = z.object({
  facts: z.array(KeyFactSchema).max(20),
});

// ─── Clause batch response ───────────────────────────────────────────────────

export const ClauseBatchResponseSchema = z.object({
  clauses: z.array(ClauseAnalysisSchema).max(50),
});

// ─── Full classification response ────────────────────────────────────────────

export const ClassificationResponseSchema = z.object({
  documentInfo: DocumentInfoSchema,
  isLegalDocument: z.boolean(),
  nonLegalReason: z.string().max(200).optional(),
});

// ─── Compare response ────────────────────────────────────────────────────────

export const ChangeTypeSchema = z.enum([
  "added",
  "removed",
  "changed",
  "shifted-toward-them",
  "shifted-toward-you",
  "unchanged",
]);

export const ClauseDiffSchema = z.object({
  id: z.string(),
  changeType: ChangeTypeSchema,
  clauseV1Id: z.string().optional(),
  clauseV2Id: z.string().optional(),
  explanation: z.string().max(500),
  significance: z.enum(["minor", "moderate", "major"]),
});

export const CompareResponseSchema = z.object({
  diffs: z.array(ClauseDiffSchema).max(60),
  verdict: z.object({
    netEffect: z.enum(["better-for-you", "worse-for-you", "neutral"]),
    summary: z.string().max(600),
    majorChanges: z.number().int().min(0),
    shiftsTowardThem: z.number().int().min(0),
    shiftsTowardYou: z.number().int().min(0),
  }),
});

// ─── Navigate response ───────────────────────────────────────────────────────

export const ActionTicketSchema = z.object({
  id: z.string(),
  what: z.string().max(300),
  by: z.string().max(100).nullable(),
  who: z.string().max(100),
  carry: z.array(z.string().max(100)).max(5),
  clauseId: z.string().optional(),
  priority: z.enum(["urgent", "important", "normal"]),
});

export const NavigateResponseSchema = z.object({
  redFlags: z.array(z.string().max(300)).max(10),
  actionTickets: z.array(ActionTicketSchema).max(15),
  questionsBeforeSigning: z.array(z.string().max(300)).max(10),
  questionsForLawyer: z.array(z.string().max(300)).max(8),
  deadlines: z
    .array(
      z.object({
        label: z.string().max(100),
        date: z.string().max(50).nullable(),
        clauseId: z.string().optional(),
      })
    )
    .max(10),
});

// ─── Ask/Q&A segment ─────────────────────────────────────────────────────────

export const AskResponseSchema = z.object({
  answer: z.string().max(1200),
  clauseIds: z.array(z.string()).max(5),
  confidence: z.number().min(0).max(1),
  notAddressed: z.boolean(),
});

export type AskResponse = z.infer<typeof AskResponseSchema>;
