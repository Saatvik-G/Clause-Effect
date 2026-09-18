import type { Clause, FinePrintScore } from "@/lib/types";

// Category risk weights — higher weight = more important for the signer
const CATEGORY_WEIGHTS: Record<string, number> = {
  Termination: 12,
  Penalty: 12,
  Liability: 10,
  Payment: 10,
  "Non-compete": 9,
  Privacy: 8,
  "Data Collection": 8,
  Arbitration: 8,
  "Auto-renewal": 7,
  "Notice Period": 7,
  Indemnification: 9,
  IP: 8,
  "Governing Law": 5,
  "Dispute Resolution": 7,
  Confidentiality: 6,
  Security: 6,
  Default: 10,
  Acceleration: 9,
  Other: 4,
};

// Risk level penalty (subtracted from fair score)
const RISK_PENALTY: Record<string, number> = {
  low: 0,
  medium: 25,
  high: 60,
  unusual: 45,
};

// Who-benefits multiplier
const WHO_BENEFITS_MULTIPLIER: Record<string, number> = {
  you: 0,     // benefits you — no penalty
  both: 0.5,  // balanced
  unclear: 0.7,
  them: 1.0,  // entirely them — full penalty
};

function getCategoryWeight(category: string): number {
  // Try exact match first, then partial match
  if (CATEGORY_WEIGHTS[category] !== undefined) {
    return CATEGORY_WEIGHTS[category];
  }
  for (const [key, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return weight;
    }
  }
  return CATEGORY_WEIGHTS["Other"];
}

/**
 * Compute Fine Print Score deterministically from clause data.
 * Score 0-100: 100 = perfectly fair, 0 = extremely risky.
 *
 * Formula:
 * - Start at 100
 * - For each clause: penalty = risk_penalty × who_benefits_multiplier × (weight/10)
 * - Deduct total penalty (capped at 100)
 * - Bonus: +5 for each negotiable clause that's high/medium risk (gives user agency)
 */
export function computeFinePrintScore(clauses: Clause[]): FinePrintScore {
  if (clauses.length === 0) {
    return {
      total: 50,
      breakdown: [],
      verdict: "mixed",
    };
  }

  const breakdown: FinePrintScore["breakdown"] = [];
  let totalPenalty = 0;

  for (const clause of clauses) {
    const weight = getCategoryWeight(clause.category);
    const riskPenalty = RISK_PENALTY[clause.risk] ?? 0;
    const benefitMult = WHO_BENEFITS_MULTIPLIER[clause.whoBenefits] ?? 0.7;

    // Normalised weight (max weight is 12, normalise to 0-1 range)
    const normWeight = weight / 12;
    const contribution = riskPenalty * benefitMult * normWeight;

    if (contribution > 0) {
      breakdown.push({
        category: clause.category,
        weight,
        rawScore: riskPenalty,
        contribution: Math.round(contribution * 10) / 10,
        notes: `${clause.title}: ${clause.risk} risk${clause.whoBenefits === "them" ? ", benefits other party" : ""}`,
      });
      totalPenalty += contribution;
    }
  }

  // Bonus for negotiable high-risk clauses (capped at 10 pts total)
  const negotiableBonus = Math.min(
    clauses.filter(
      (c) =>
        c.negotiable &&
        (c.risk === "high" || c.risk === "medium" || c.risk === "unusual")
    ).length * 2,
    10
  );

  const rawScore = Math.max(0, 100 - totalPenalty + negotiableBonus);
  const total = Math.round(Math.min(100, Math.max(0, rawScore)));

  const verdict: FinePrintScore["verdict"] =
    total >= 80
      ? "very-fair"
      : total >= 65
      ? "fair"
      : total >= 45
      ? "mixed"
      : total >= 25
      ? "risky"
      : "very-risky";

  // Sort breakdown by contribution descending
  breakdown.sort((a, b) => b.contribution - a.contribution);

  return { total, breakdown: breakdown.slice(0, 8), verdict };
}

export function getVerdictLabel(verdict: FinePrintScore["verdict"]): string {
  const labels = {
    "very-fair": "VERY FAIR",
    fair: "FAIR",
    mixed: "MIXED",
    risky: "RISKY",
    "very-risky": "VERY RISKY",
  };
  return labels[verdict];
}
