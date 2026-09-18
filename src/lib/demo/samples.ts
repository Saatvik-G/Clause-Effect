/**
 * Demo mode: precomputed analysis JSON for all 5 sample documents.
 * This allows the full UX to work offline / without an API key.
 */

import type { AnalysisResult, NavigateResult, CompareResult } from "@/lib/types";

export const DEMO_SAMPLES = [
  {
    id: "rental",
    label: "Rental Agreement",
    description: "11-month residential tenancy in Bengaluru",
    file: "/samples/rental-agreement.txt",
    icon: "🏠",
  },
  {
    id: "employment",
    label: "Job Offer Letter",
    description: "Product Manager offer at a tech startup",
    file: "/samples/job-offer.txt",
    icon: "💼",
  },
  {
    id: "freelance",
    label: "Freelance Contract",
    description: "E-commerce website development project",
    file: "/samples/freelance-contract.txt",
    icon: "📋",
  },
  {
    id: "loan",
    label: "Personal Loan Agreement",
    description: "₹5 lakh personal loan from a finance company",
    file: "/samples/loan-agreement.txt",
    icon: "💰",
  },
  {
    id: "appterms",
    label: "App Terms of Service",
    description: "TaskFlow app terms & privacy policy",
    file: "/samples/app-terms.txt",
    icon: "📱",
  },
] as const;

// Precomputed analysis for rental agreement (sample)
export const DEMO_RENTAL_ANALYSIS: AnalysisResult = {
  id: "demo-rental-001",
  isDemo: true,
  contentHash: "demo-rental",
  analyzedAt: Date.now(),
  rawText: "Sample rental agreement text",
  documentInfo: {
    type: "rental",
    typeLabel: "Residential Tenancy Agreement",
    language: "English",
    jurisdiction: "Karnataka, India",
    parties: { you: "Arjun Mehta (Tenant)", them: "Priya Sharma (Landlord)" },
    detectedAt: Date.now(),
  },
  clauses: [
    {
      id: "clause-1",
      index: 0,
      title: "Auto-Renewal with Long Notice",
      verbatimQuote:
        "This Agreement shall automatically renew for successive 11-month periods unless either party provides written notice of non-renewal at least 60 (sixty) days before the expiry of the then-current term.",
      charStart: 0,
      charEnd: 200,
      category: "Auto-renewal",
      risk: "high",
      plainMeaning: {
        simple:
          "Your lease automatically restarts every 11 months. You must warn the landlord 60 days in advance if you want to leave — that's 2 months' notice before the lease ends.",
        standard:
          "The lease renews automatically. To avoid being locked in for another term, you need to send written notice 60 days before your current lease ends. Missing this window means you're committed to another 11 months.",
        lawyerLite:
          "Automatic renewal clause with a 60-day pre-expiry notice requirement. This is standard in Karnataka leases. Note: the notice must be 'written' — verbal notice is insufficient. Track the date carefully.",
      },
      whyItMatters:
        "If you forget the 60-day deadline, you're automatically bound to another 11 months and could owe 2 months rent in penalties if you try to leave.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF you don't give 60 days' notice before lease end",
          consequence:
            "THEN the lease automatically renews for another 11 months and you remain liable for all rent",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Consider negotiating: 'either party provides 30 (thirty) days written notice' instead of 60 days",
      confidence: 0.95,
      verified: true,
      relatedClauseIds: ["clause-6"],
    },
    {
      id: "clause-2",
      index: 1,
      title: "Large Security Deposit (6 Months)",
      verbatimQuote:
        "The Tenant has paid a refundable security deposit of Rs. 1,68,000 (equivalent to six months' rent) upon signing this Agreement.",
      charStart: 200,
      charEnd: 400,
      category: "Security",
      risk: "high",
      plainMeaning: {
        simple:
          "You pay ₹1,68,000 upfront as deposit — that's 6 months of rent. Standard in most states is 1-3 months. 6 months is unusually high.",
        standard:
          "The deposit is 6 months rent (₹1,68,000). Many Indian states have guidelines suggesting deposits should not exceed 2-3 months. This landlord is asking for much more, and no interest is paid on it.",
        lawyerLite:
          "Security deposit of 6 months rent — worth querying under Karnataka Rent Control Act provisions. The absence of an interest obligation on the deposit is common but worth noting; some jurisdictions require it.",
      },
      whyItMatters:
        "₹1,68,000 tied up with no interest is a significant amount. The refund timeline is 30 days — check what deductions are permissible.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF you cause damages or leave without notice",
          consequence:
            "THEN the landlord can deduct from the deposit and return only the balance within 30 days",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Suggest: 'security deposit equivalent to two months rent' with interest at savings account rates",
      confidence: 0.98,
      verified: true,
      relatedClauseIds: ["clause-6"],
    },
    {
      id: "clause-3",
      index: 2,
      title: "Landlord Entry Without Notice",
      verbatimQuote:
        "The Landlord or their representative may enter the Property at any time and without prior notice for inspection, repairs, or any other purpose deemed necessary by the Landlord.",
      charStart: 400,
      charEnd: 600,
      category: "Privacy",
      risk: "unusual",
      plainMeaning: {
        simple:
          "The landlord can walk into your home at any time, for any reason, without telling you first. This is unusual — most agreements require at least 24-48 hours notice.",
        standard:
          "This clause gives the landlord unrestricted entry rights with no notice requirement. This could mean surprise inspections, entry while you're away, or entry at any hour. It significantly affects your privacy rights.",
        lawyerLite:
          "Unconditional right of entry without notice is unusual and potentially intrusive. Worth asking about and seeking to amend to at least 24-48 hours notice except in genuine emergencies.",
      },
      whyItMatters:
        "Your privacy and peaceful enjoyment of the home is at stake. Compare: Version 2 of this agreement requires 48 hours notice.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF the landlord wants to enter for any reason",
          consequence: "THEN they can do so immediately without telling you",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Request: 'The Landlord shall provide at least 48 hours prior written notice before entry, except in emergencies'",
      confidence: 0.96,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-4",
      index: 3,
      title: "Steep Late Fee (₹500/Day)",
      verbatimQuote:
        "If rent is not paid by the 10th of the month, a late fee of Rs. 500 per day shall be charged until payment is made.",
      charStart: 600,
      charEnd: 780,
      category: "Penalty",
      risk: "high",
      plainMeaning: {
        simple:
          "If you're late on rent after the 10th, you pay ₹500 for every single day you're late. 20 late days = ₹10,000 in fees on top of rent.",
        standard:
          "The late fee is ₹500 per day from the 11th of the month. This adds up quickly — a payment delay of just one month could add ₹15,000–₹18,000 in penalties.",
        lawyerLite:
          "Per-diem late fee of ₹500 is on the higher end. At ₹15,000/month penalty potential, this is worth negotiating. Courts may consider whether such penalties are reasonable.",
      },
      whyItMatters:
        "A bank delay, salary delay, or any disruption could cost you ₹500 per day before you even realise it.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF rent is not paid by the 10th",
          consequence: "THEN ₹500 per day is charged until paid, and after 30 days, the landlord can terminate",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Suggest: 'a one-time late fee of Rs. 1,000 if rent is delayed beyond the 15th of the month'",
      confidence: 0.97,
      verified: true,
      relatedClauseIds: ["clause-6"],
    },
    {
      id: "clause-5",
      index: 4,
      title: "Termination: Deposit Forfeited in First 4 Months",
      verbatimQuote:
        "The Tenant may not terminate this Agreement in the first 4 months of the tenancy without forfeiting the entire security deposit.",
      charStart: 780,
      charEnd: 950,
      category: "Termination",
      risk: "high",
      plainMeaning: {
        simple:
          "If you need to leave in the first 4 months — for any reason — you lose your entire ₹1,68,000 deposit. That's a very large financial risk.",
        standard:
          "You're locked in for 4 months. Any early exit in this period, regardless of reason (job loss, family emergency, etc.), means losing ₹1,68,000. After 4 months, normal 2-month notice applies.",
        lawyerLite:
          "Lock-in period of 4 months with full deposit forfeiture as penalty for early exit. This is a liquidated damages clause — worth assessing proportionality. Consider negotiating a shorter lock-in or proportional forfeiture.",
      },
      whyItMatters:
        "Life circumstances change. A job relocation or family emergency in the first 4 months could cost you ₹1,68,000.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF you leave in the first 4 months",
          consequence: "THEN you forfeit the entire ₹1,68,000 security deposit",
        },
        {
          condition: "IF you leave after 4 months with 2 months notice",
          consequence: "THEN you get your deposit back (minus any deductions)",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Suggest: 'In the first 2 months, a break fee of one month's rent applies; deposit is otherwise refundable'",
      confidence: 0.95,
      verified: true,
      relatedClauseIds: ["clause-2"],
    },
    {
      id: "clause-6",
      index: 5,
      title: "Arbitrator Appointed by Landlord Only",
      verbatimQuote:
        "The arbitrator shall be appointed solely by the Landlord. Costs of arbitration shall be borne equally by both parties.",
      charStart: 950,
      charEnd: 1100,
      category: "Dispute Resolution",
      risk: "unusual",
      plainMeaning: {
        simple:
          "If there's a dispute, a judge (arbitrator) decides the outcome — but the landlord gets to pick who that judge is. You have no say. This is unusual and unfair.",
        standard:
          "Arbitration is handled by an arbitrator chosen solely by the landlord. This creates a conflict of interest — the decision-maker was chosen by one party. You share arbitration costs equally even though you had no say in the arbitrator.",
        lawyerLite:
          "One-sided arbitrator appointment is worth challenging. Under the Arbitration and Conciliation Act, 1996, unilateral appointment can be challenged for bias. The equal cost-sharing is also worth querying given the imbalance.",
      },
      whyItMatters:
        "In a dispute, the landlord's chosen arbitrator may not be neutral. You could pay half the costs of an unfair process.",
      whoBenefits: "them",
      ifThenEffects: [
        {
          condition: "IF a dispute arises",
          consequence:
            "THEN it goes to an arbitrator chosen solely by the landlord, with costs split equally",
        },
      ],
      negotiable: true,
      counterLanguage:
        "Suggest: 'The arbitrator shall be mutually appointed by both parties, or failing agreement, appointed by the President of the Karnataka Bar Association'",
      confidence: 0.92,
      verified: true,
      relatedClauseIds: ["clause-4", "clause-5"],
    },
  ],
  keyFacts: [
    {
      id: "fact-1",
      label: "Monthly Rent",
      value: "Rs. 28,000",
      clauseId: "clause-1",
      verified: true,
      category: "amount",
    },
    {
      id: "fact-2",
      label: "Security Deposit",
      value: "Rs. 1,68,000 (6 months)",
      clauseId: "clause-2",
      verified: true,
      category: "amount",
    },
    {
      id: "fact-3",
      label: "Tenancy Term",
      value: "11 months (1 Mar 2024 – 31 Jan 2025)",
      clauseId: "clause-1",
      verified: true,
      category: "term",
    },
    {
      id: "fact-4",
      label: "Auto-Renewal Notice",
      value: "60 days before expiry",
      clauseId: "clause-1",
      verified: true,
      category: "renewal",
    },
    {
      id: "fact-5",
      label: "Late Fee",
      value: "Rs. 500 per day after 10th of month",
      clauseId: "clause-4",
      verified: true,
      category: "penalty",
    },
    {
      id: "fact-6",
      label: "Landlord",
      value: "Priya Sharma",
      clauseId: "clause-1",
      verified: true,
      category: "party",
    },
    {
      id: "fact-7",
      label: "Tenant",
      value: "Arjun Mehta",
      clauseId: "clause-1",
      verified: true,
      category: "party",
    },
    {
      id: "fact-8",
      label: "Governing Law",
      value: "Karnataka, India",
      clauseId: "clause-6",
      verified: true,
      category: "law",
    },
    {
      id: "fact-9",
      label: "Termination Notice",
      value: "2 months (after 4-month lock-in)",
      clauseId: "clause-5",
      verified: true,
      category: "notice",
    },
    {
      id: "fact-10",
      label: "Deposit Refund Period",
      value: "30 days after vacating",
      clauseId: "clause-2",
      verified: true,
      category: "date",
    },
  ],
  score: {
    total: 28,
    breakdown: [
      {
        category: "Termination",
        weight: 12,
        rawScore: 60,
        contribution: 60,
        notes: "Deposit forfeiture clause: high risk, benefits landlord",
      },
      {
        category: "Penalty",
        weight: 12,
        rawScore: 60,
        contribution: 60,
        notes: "₹500/day late fee: high risk, benefits landlord",
      },
      {
        category: "Auto-renewal",
        weight: 7,
        rawScore: 60,
        contribution: 35,
        notes: "60-day notice: high risk, benefits landlord",
      },
      {
        category: "Privacy",
        weight: 8,
        rawScore: 45,
        contribution: 30,
        notes: "No-notice entry: unusual, benefits landlord",
      },
      {
        category: "Dispute Resolution",
        weight: 7,
        rawScore: 45,
        contribution: 26.25,
        notes: "Unilateral arbitrator: unusual, benefits landlord",
      },
    ],
    verdict: "very-risky",
  },
  missingProtections: [
    {
      id: "r1",
      name: "Security deposit limit",
      description: "Deposit should not exceed 2 months rent in most states",
      critical: true,
    },
    {
      id: "r2",
      name: "Move-in / move-out inspection clause",
      description: "Both parties should document property condition at start and end",
      critical: true,
    },
  ],
};

// Demo navigate result for rental
export const DEMO_RENTAL_NAVIGATE: NavigateResult = {
  analyzedAt: Date.now(),
  redFlags: [
    "Security deposit is 6 months rent (₹1,68,000) — unusually high. Standard is 1–3 months.",
    "Landlord can enter your home at any time without notice. This is a privacy risk.",
    "60-day auto-renewal notice period: you must act 2 months before lease ends or get locked in.",
    "Leaving in first 4 months means losing the ENTIRE ₹1,68,000 deposit.",
    "₹500/day late fee is steep — a 20-day delay costs ₹10,000 extra.",
    "Arbitrator appointed solely by landlord — potential conflict of interest in disputes.",
  ],
  actionTickets: [
    {
      id: "ticket-1",
      what: "Mark 1 November 2024 in your calendar as your 60-day notice deadline",
      by: "2024-11-01",
      who: "You",
      carry: ["Written notice template", "Proof of delivery (WhatsApp screenshot or courier receipt)"],
      clauseId: "clause-1",
      priority: "urgent",
    },
    {
      id: "ticket-2",
      what: "Document the property condition in writing and photos before moving in",
      by: "2024-03-01",
      who: "You + Landlord",
      carry: ["Camera or smartphone", "A written checklist of each room's condition"],
      clauseId: "clause-2",
      priority: "urgent",
    },
    {
      id: "ticket-3",
      what: "Negotiate the deposit down to 2 months (₹56,000) or request interest on the deposit",
      by: null,
      who: "Landlord",
      carry: ["This analysis report", "Reference to Karnataka tenancy norms"],
      clauseId: "clause-2",
      priority: "important",
    },
    {
      id: "ticket-4",
      what: "Ask the landlord to add a 48-hour notice requirement before entry",
      by: null,
      who: "Landlord",
      carry: [],
      clauseId: "clause-3",
      priority: "important",
    },
    {
      id: "ticket-5",
      what: "Set up auto-payment for rent to avoid the ₹500/day late fee",
      by: "2024-03-05",
      who: "Your bank",
      carry: ["Landlord's bank details"],
      clauseId: "clause-4",
      priority: "urgent",
    },
  ],
  questionsBeforeSigning: [
    "Can we reduce the security deposit to 2 months (₹56,000) or 3 months?",
    "Will you pay interest on the deposit while you hold it?",
    "Can the notice period for you to enter my home be at least 48 hours?",
    "Can the auto-renewal notice period be 30 days instead of 60 days?",
    "What is the process for returning my deposit — will you provide a written breakdown of any deductions?",
    "Are there any society rules I should know about before signing?",
  ],
  questionsForLawyer: [
    "Is a 6-month security deposit enforceable under Karnataka tenancy law?",
    "Can I challenge the unilateral arbitrator appointment if a dispute arises?",
    "What are my legal rights if the landlord enters without notice?",
    "Is the ₹500/day late fee a valid liquidated damages clause or could it be challenged as a penalty?",
  ],
  deadlines: [
    {
      label: "First rent payment due",
      date: "2024-04-05",
      clauseId: "clause-4",
    },
    {
      label: "Auto-renewal notice deadline (to avoid renewal)",
      date: "2024-11-01",
      clauseId: "clause-1",
    },
    {
      label: "Lease end date",
      date: "2025-01-31",
      clauseId: "clause-1",
    },
  ],
};

// Demo compare result
export const DEMO_COMPARE_RESULT: CompareResult = {
  analyzedAt: Date.now(),
  verdict: {
    netEffect: "better-for-you",
    summary:
      "Version 2 significantly improves tenant protections. Rent increased by ₹3,000 but deposit dropped from 6 months to 2 months (saving ₹1,12,000 upfront). Landlord must now give 48 hours notice before entry. Auto-renewal and termination notice periods are shorter. Dispute resolution now involves neutral courts instead of landlord-appointed arbitrator.",
    majorChanges: 5,
    shiftsTowardThem: 1,
    shiftsTowardYou: 5,
  },
  diffs: [
    {
      id: "diff-1",
      changeType: "shifted-toward-them",
      explanation:
        "Rent increased from ₹28,000 to ₹31,000 per month (₹3,000 more = ₹33,000 extra per year).",
      significance: "major",
    },
    {
      id: "diff-2",
      changeType: "shifted-toward-you",
      explanation:
        "Security deposit dropped from 6 months (₹1,68,000) to 2 months (₹62,000). Saves ₹1,06,000 upfront. Plus: interest is now paid on the deposit at 6% per annum.",
      significance: "major",
    },
    {
      id: "diff-3",
      changeType: "shifted-toward-you",
      explanation:
        "Landlord must now give 48 hours written notice before entering, except for emergencies. Version 1 had no notice requirement.",
      significance: "major",
    },
    {
      id: "diff-4",
      changeType: "shifted-toward-you",
      explanation:
        "Auto-renewal notice period reduced from 60 days to 30 days. Easier to remember and act on.",
      significance: "moderate",
    },
    {
      id: "diff-5",
      changeType: "shifted-toward-you",
      explanation:
        "Termination notice is now 30 days (was 2 months). Lock-in period is now 2 months (was 4 months). Much fairer.",
      significance: "major",
    },
    {
      id: "diff-6",
      changeType: "shifted-toward-you",
      explanation:
        "Dispute resolution now through Bangalore Rent Authority or civil courts — neutral. Version 1 had landlord-appointed arbitrator.",
      significance: "major",
    },
    {
      id: "diff-7",
      changeType: "shifted-toward-you",
      explanation:
        "Late fee reduced from ₹500/day after 10th to ₹200/day after 15th. Much more reasonable.",
      significance: "moderate",
    },
  ],
};

import { getSampleAnalysisById } from "./all-samples";

export async function loadDemoAnalysis(sampleId: string): Promise<AnalysisResult> {
  const analysis = getSampleAnalysisById(sampleId);
  return {
    ...analysis,
    id: `demo-${sampleId}`,
    isDemo: true,
  };
}
