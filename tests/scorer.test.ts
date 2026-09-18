import { describe, it, expect } from "vitest";
import { computeFinePrintScore } from "@/lib/pipeline/scorer";
import type { Clause } from "@/lib/types";

function makeClause(overrides: Partial<Clause>): Clause {
  return {
    id: "clause-1",
    index: 0,
    title: "Test Clause",
    verbatimQuote: "Test quote",
    charStart: 0,
    charEnd: 10,
    category: "Termination",
    risk: "low",
    plainMeaning: { simple: "", standard: "", lawyerLite: "" },
    whyItMatters: "",
    whoBenefits: "both",
    ifThenEffects: [],
    negotiable: false,
    confidence: 0.9,
    verified: true,
    relatedClauseIds: [],
    ...overrides,
  };
}

describe("computeFinePrintScore", () => {
  it("returns 50 for empty clause list", () => {
    const result = computeFinePrintScore([]);
    expect(result.total).toBe(50);
    expect(result.verdict).toBe("mixed");
  });

  it("returns high score for all-low-risk clauses", () => {
    const clauses = [
      makeClause({ risk: "low", whoBenefits: "you", category: "Termination" }),
      makeClause({ id: "clause-2", risk: "low", whoBenefits: "both", category: "Payment" }),
    ];
    const result = computeFinePrintScore(clauses);
    expect(result.total).toBeGreaterThan(70);
  });

  it("returns low score for high-risk clauses benefiting them", () => {
    const clauses = [
      makeClause({ risk: "high", whoBenefits: "them", category: "Termination" }),
      makeClause({ id: "clause-2", risk: "high", whoBenefits: "them", category: "Penalty" }),
      makeClause({ id: "clause-3", risk: "high", whoBenefits: "them", category: "Liability" }),
    ];
    const result = computeFinePrintScore(clauses);
    expect(result.total).toBeLessThan(40);
    expect(["risky", "very-risky"]).toContain(result.verdict);
  });

  it("gives negotiable bonus for negotiable high-risk clauses", () => {
    const nonNeg = makeClause({ risk: "high", whoBenefits: "them", negotiable: false });
    const neg = makeClause({ risk: "high", whoBenefits: "them", negotiable: true });
    const scoreNonNeg = computeFinePrintScore([nonNeg]);
    const scoreNeg = computeFinePrintScore([neg]);
    expect(scoreNeg.total).toBeGreaterThan(scoreNonNeg.total);
  });

  it("score is always 0-100", () => {
    const extremeClauses = Array.from({ length: 10 }, (_, i) =>
      makeClause({ id: `clause-${i}`, risk: "high", whoBenefits: "them", category: "Penalty" })
    );
    const result = computeFinePrintScore(extremeClauses);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it("returns correct verdict labels", () => {
    const fairResult = computeFinePrintScore([makeClause({ risk: "low", whoBenefits: "both" })]);
    expect(["very-fair", "fair", "mixed"]).toContain(fairResult.verdict);
  });
});
