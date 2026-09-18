export interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
  riskNote?: string;
}

export const LEGAL_GLOSSARY: GlossaryTerm[] = [
  {
    term: "Liquidated Damages",
    definition: "A pre-agreed amount of money that one party must pay if they break a specific term of the contract, without needing to prove actual loss in court.",
    example: "Losing your entire ₹1,68,000 security deposit if you move out before month 4.",
    riskNote: "Look out for amounts that are disproportionately higher than any realistic damage.",
  },
  {
    term: "Arbitration",
    definition: "A private dispute resolution method outside ordinary courts, where an independent arbitrator makes a legally binding decision.",
    example: "Resolving rent disputes before a private arbitrator in Bengaluru instead of a civil court.",
    riskNote: "Unfair if only one party gets to choose the arbitrator or if fees are steep.",
  },
  {
    term: "Indemnification",
    definition: "An agreement by one party to pay for or compensate the financial loss or legal costs incurred by the other party.",
    example: "Paying your client's legal fees if a copyright claim is brought against software you built.",
    riskNote: "Uncapped indemnities can cause unlimited financial liability.",
  },
  {
    term: "Acceleration Clause",
    definition: "A clause in a loan or payment agreement that makes the entire remaining debt immediately payable upon a single default or breach.",
    example: "Demanding immediate repayment of all remaining 24 months of loan EMIs if you are 7 days late.",
    riskNote: "High risk — can trigger instant bankruptcy if a single payment is missed.",
  },
  {
    term: "Non-Compete Clause",
    definition: "A restriction prohibiting an employee or contractor from working for a competitor or starting a similar business for a set period after leaving.",
    example: "Banning a product manager from working anywhere in tech in India for 24 months.",
    riskNote: "Under Section 27 of the Indian Contract Act, post-employment non-compete clauses are generally void in restraint of trade.",
  },
  {
    term: "Force Majeure",
    definition: "An 'act of God' or unforeseeable event (war, natural disaster, pandemic) that excuses one or both parties from fulfilling their contractual obligations.",
    example: "Not having to pay rent while a property is declared uninhabitable after a flood.",
    riskNote: "Check whether you still have to pay rent/fees during a force majeure event.",
  },
  {
    term: "Severability",
    definition: "A clause stating that if one part of the contract is declared illegal or invalid by a court, the remainder of the contract remains valid and enforceable.",
    example: "If a 24-month non-compete is invalidated, your salary and confidentiality terms remain in effect.",
  },
  {
    term: "Lock-in Period",
    definition: "A minimum fixed duration during which neither party is allowed to terminate the contract without paying severe financial penalties.",
    example: "A 4-month lock-in on a lease where early departure forfeits all 6 months of deposit.",
    riskNote: "Ensure the lock-in duration is balanced and allows early termination for emergencies or job transfer.",
  },
  {
    term: "Subrogation",
    definition: "The legal right of one party (typically an insurer) to step into the shoes of another and take legal action against a third party who caused the loss.",
    example: "An insurance company paying your hospital bill and then suing the negligent party.",
  },
  {
    term: "Governing Law and Jurisdiction",
    definition: "The specific state or country's laws that will apply to interpret the contract, and which city's courts have the exclusive authority to hear lawsuits.",
    example: "Specifying that only courts in Bengaluru, Karnataka have authority, forcing an out-of-state party to travel for hearings.",
  },
];

/**
 * Helper to find glossary terms in a text string
 */
export function findGlossaryTerms(text: string): GlossaryTerm[] {
  const textLower = text.toLowerCase();
  return LEGAL_GLOSSARY.filter((g) => textLower.includes(g.term.toLowerCase()));
}
