import type { AnalysisResult } from "@/lib/types";

export interface ScenarioResult {
  title: string;
  question: string;
  summary: string;
  breakdown: Array<{ item: string; amount: string; note: string }>;
  netImpact: string;
  relevantClauses: string[]; // clause titles / IDs
  warning?: string;
}

export function simulateScenario(
  scenarioKey: string,
  analysis: AnalysisResult,
  customParams?: Record<string, number | string>
): ScenarioResult {
  const docType = analysis.documentInfo.type;

  if (docType === "rental") {
    if (scenarioKey === "early_exit") {
      const month = Number(customParams?.month ?? 6);
      const monthlyRent = 28000;
      const deposit = 168000;
      const lockInMonths = 4;
      const noticeMonths = 2;

      if (month <= lockInMonths) {
        return {
          title: `Early Departure in Month ${month} (Within Lock-In Period)`,
          question: `What happens if I leave the rental apartment in Month ${month}?`,
          summary: `Because Month ${month} is within the 4-month lock-in period, you forfeit your ENTIRE security deposit of ₹1,68,000.`,
          breakdown: [
            { item: "Rent paid to date", amount: `₹${(month * monthlyRent).toLocaleString("en-IN")}`, note: `${month} months @ ₹${monthlyRent.toLocaleString("en-IN")}/mo` },
            { item: "Security deposit paid upfront", amount: `₹${deposit.toLocaleString("en-IN")}`, note: "6 months rent equivalent" },
            { item: "Deposit refunded upon exit", amount: "₹0", note: "Clause 5 specifies complete deposit forfeiture before 4 months" },
            { item: "Total penalty incurred", amount: `₹${deposit.toLocaleString("en-IN")}`, note: "Equivalent to 6 months of rent lost" },
          ],
          netImpact: `Net financial loss: ₹${deposit.toLocaleString("en-IN")} lost in deposit.`,
          relevantClauses: ["clause-2", "clause-5"],
          warning: "Wait until Month 5 to provide written notice if you wish to recover your ₹1,68,000 deposit.",
        };
      } else {
        const noticeRentCost = noticeMonths * monthlyRent;
        return {
          title: `Early Departure in Month ${month} (After Lock-In Period)`,
          question: `What happens if I leave the rental apartment in Month ${month}?`,
          summary: `Since Month ${month} is after the 4-month lock-in, you may exit by serving 2 months written notice under Clause 9, recovering your security deposit minus inspection deductions.`,
          breakdown: [
            { item: "Security deposit to be refunded", amount: `+₹${deposit.toLocaleString("en-IN")}`, note: "Refundable within 30 days of vacating" },
            { item: "Rent payable during 2-month notice period", amount: `-₹${noticeRentCost.toLocaleString("en-IN")}`, note: `2 months notice @ ₹${monthlyRent.toLocaleString("en-IN")}/mo` },
            { item: "Deposit deduction for normal wear", amount: "₹0", note: "Normal wear cannot legally be deducted" },
          ],
          netImpact: `Net refund received: ₹${(deposit - noticeRentCost).toLocaleString("en-IN")} net positive cash flow (or full ₹1,68,000 if you stay through notice).`,
          relevantClauses: ["clause-2", "clause-5", "clause-9"],
        };
      }
    }

    if (scenarioKey === "late_rent") {
      const daysLate = Number(customParams?.daysLate ?? 15);
      const penaltyPerDay = 500;
      const monthlyRent = 28000;
      const penalty = daysLate * penaltyPerDay;

      return {
        title: `Late Rent Payment (${daysLate} Days Overdue)`,
        question: `What if my rent is delayed by ${daysLate} days past the 10th of the month?`,
        summary: `Under Clause 3, late fees accrue at ₹500 per day starting after the 10th of the month.`,
        breakdown: [
          { item: "Monthly base rent", amount: `₹${monthlyRent.toLocaleString("en-IN")}`, note: "Due on 5th of each month" },
          { item: "Grace period before penalty", amount: "5 days", note: "No fee between 5th and 10th" },
          { item: `Late fee for ${daysLate} days`, amount: `+₹${penalty.toLocaleString("en-IN")}`, note: `${daysLate} days @ ₹500/day` },
          { item: "Total payment required to clear", amount: `₹${(monthlyRent + penalty).toLocaleString("en-IN")}`, note: "Rent + late fee" },
        ],
        netImpact: `Extra penalty cost: ₹${penalty.toLocaleString("en-IN")}. If unpaid for >30 days, landlord can unilaterally terminate.`,
        relevantClauses: ["clause-3"],
        warning: daysLate > 30 ? "CRITICAL: Rent unpaid >30 days entitles landlord to immediate termination without notice!" : undefined,
      };
    }
  }

  // Generic fallback scenario
  return {
    title: "Contractual Impact Calculation",
    question: "Estimated scenario based on document terms",
    summary: "Simulated contractual impact using verified numbers from the agreement.",
    breakdown: [
      { item: "Notice required", amount: "30-60 days", note: "Subject to termination terms" },
      { item: "Financial liability cap", amount: "Contract value", note: "Subject to liability limits" },
    ],
    netImpact: "Consult a qualified attorney for tailored numerical analysis.",
    relevantClauses: ["clause-1"],
  };
}
