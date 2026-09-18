import type { AnalysisResult } from "@/lib/types";
import { DEMO_RENTAL_ANALYSIS } from "./samples";

// ─── Employment Sample Analysis ──────────────────────────────────────────────
export const DEMO_EMPLOYMENT_ANALYSIS: AnalysisResult = {
  id: "demo-employment-001",
  isDemo: true,
  contentHash: "demo-employment",
  analyzedAt: Date.now(),
  rawText: "Sample employment offer letter text",
  documentInfo: {
    type: "employment",
    typeLabel: "Offer of Employment",
    language: "English",
    jurisdiction: "Karnataka, India",
    parties: { you: "Kavya Nair", them: "TechVenture Solutions Pvt. Ltd." },
    detectedAt: Date.now(),
  },
  clauses: [
    {
      id: "clause-1",
      index: 0,
      title: "24-Month Nationwide Tech Non-Compete",
      verbatimQuote:
        "For a period of 24 (twenty-four) months following the termination of your employment, for any reason, you shall not directly or indirectly: (a) be employed by, consult for, or own more than 1% of any company operating in the technology sector in India; (b) solicit any current or former customer, client, or employee of the Company; (c) start a competing business in any sector in which the Company operates or has operated in the past 3 years.",
      charStart: 0,
      charEnd: 300,
      category: "Non-compete",
      risk: "high",
      plainMeaning: {
        simple: "You cannot work for ANY technology company in India for 2 full years after leaving, or start a tech company. This is unusually broad.",
        standard: "This non-compete prohibits you from working for any tech company in India for 24 months after departure. Under Section 27 of the Indian Contract Act, post-employment non-compete clauses are generally unenforceable in India, but employers still try to intimidate employees with them.",
        lawyerLite: "Section 27 restraint of trade issue. Post-service non-compete covenants are void under Indian law (Percept D'Mark v. Zaheer Khan). However, non-solicitation of clients/employees may be partially defensible if reasonable.",
      },
      whyItMatters: "Signing an unenforceable clause may still result in legal notices, threats, or withheld relieving letters if you transition to another tech company.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF you leave TechVenture Solutions", consequence: "THEN company asserts you cannot work anywhere in Indian tech for 24 months" },
      ],
      negotiable: true,
      counterLanguage: "Limit to: 'direct competitors with similar products' for a period of 3-6 months, or strike the non-compete completely.",
      confidence: 0.98,
      verified: true,
      relatedClauseIds: ["clause-3"],
    },
    {
      id: "clause-2",
      index: 1,
      title: "Total IP Claim Even Outside Work Hours",
      verbatimQuote:
        "All work, inventions, ideas, code, designs, documents, and any other output created by you, whether during or outside working hours, and whether or not using Company resources, shall be the exclusive property of the Company.",
      charStart: 300,
      charEnd: 550,
      category: "IP",
      risk: "high",
      plainMeaning: {
        simple: "The company claims ownership of everything you make, even side projects built on weekends, on your own laptop, with no company resources.",
        standard: "This intellectual property assignment claims rights over all creative output created outside working hours and without company equipment. This deprives you of personal project ownership.",
        lawyerLite: "Overbroad IP assignment covenant. Standard practice limits assignment to IP created within scope of duties or utilizing company confidential info and hardware.",
      },
      whyItMatters: "Any open-source contribution, mobile app, or weekend startup you build while employed could legally be claimed by this employer.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF you build a personal app on a Sunday on your own laptop", consequence: "THEN TechVenture owns all copyrights and commercial rights" },
      ],
      negotiable: true,
      counterLanguage: "Amend to: 'All work created by you within the scope of your employment or utilizing Company assets and confidential materials.'",
      confidence: 0.97,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-3",
      index: 2,
      title: "Asymmetric Probation Notice (7 vs 30 Days)",
      verbatimQuote:
        "During the probation period, your employment may be terminated by the Company with 7 days' notice or payment in lieu thereof, without any reason. You may resign during probation with 30 days' notice.",
      charStart: 550,
      charEnd: 750,
      category: "Probation",
      risk: "medium",
      plainMeaning: {
        simple: "They can fire you with just 7 days notice without giving a reason, but you have to serve a full 30 days if you want to quit.",
        standard: "The probation termination terms are one-sided. The employer enjoys a 7-day quick exit window while holding the employee to a 30-day notice requirement.",
        lawyerLite: "Asymmetric notice periods during probation are lawful under freedom of contract, but strongly favor the employer. A balanced contract provides equal notice (e.g. 15 or 30 days both ways).",
      },
      whyItMatters: "Lack of job security during initial 6 months while limiting your mobility to accept alternative offers quickly.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF company terminates during probation", consequence: "THEN they only owe 7 days pay/notice" },
        { condition: "IF you resign during probation", consequence: "THEN you must serve 30 days or risk withheld relieving letter" },
      ],
      negotiable: true,
      counterLanguage: "Request: 'Either party may terminate during probation with 15 days written notice or pay in lieu.'",
      confidence: 0.94,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-4",
      index: 3,
      title: "Unilateral Bonus Modification & Withdrawal",
      verbatimQuote:
        "Performance Bonus: Up to 20% of annual basic salary, payable at the Company's sole discretion. The Company reserves the right to modify, defer, or withdraw the bonus at any time without notice or reason.",
      charStart: 750,
      charEnd: 950,
      category: "Payment",
      risk: "medium",
      plainMeaning: {
        simple: "The 20% bonus is not guaranteed. The company can change, delay, or cancel it entirely at any time without giving you a reason.",
        standard: "The performance bonus is purely discretionary and explicitly revocable without cause. Do not budget your living expenses expecting this money.",
        lawyerLite: "Discretionary variable compensation language prevents an employee from establishing an enforceable contractual entitlement to bonus payments.",
      },
      whyItMatters: "CTC includes bonus, but take-home guarantee is strictly limited to the fixed monthly compensation.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF company decides not to pay bonuses this year", consequence: "THEN you have no legal recourse to claim it" },
      ],
      negotiable: false,
      confidence: 0.96,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-5",
      index: 4,
      title: "No Overtime & Expected Weekend Hours",
      verbatimQuote:
        "You are expected to work Monday to Friday from 9:00 AM to 7:00 PM and any additional hours as required by the business, including weekends. No overtime compensation is payable for additional hours worked.",
      charStart: 950,
      charEnd: 1150,
      category: "Working Hours",
      risk: "medium",
      plainMeaning: {
        simple: "Standard work day is already 10 hours (50 hrs/week), plus weekends as required, with zero overtime pay.",
        standard: "Baseline hours exceed standard 48 hours/week thresholds established under the Karnataka Shops and Commercial Establishments Act.",
        lawyerLite: "Managerial exemption may apply to Product Managers under state Shops & Establishments legislation, but baseline 50-hour schedules without compensatory off warrant clarification.",
      },
      whyItMatters: "High risk of burnout with no additional remuneration or compensatory time off.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF projects require weekend work", consequence: "THEN no overtime pay or compensatory leaves are granted" },
      ],
      negotiable: true,
      counterLanguage: "Ask for compensatory off (comp-off) policy for weekend work hours.",
      confidence: 0.93,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-6",
      index: 5,
      title: "Immediate Termination for Poor Performance",
      verbatimQuote:
        "The Company may terminate your employment immediately, without notice or compensation, for misconduct, poor performance, or any reason deemed sufficient by the Company's Board of Directors.",
      charStart: 1150,
      charEnd: 1350,
      category: "Termination",
      risk: "high",
      plainMeaning: {
        simple: "They can fire you immediately with NO notice and NO pay simply by claiming 'poor performance' without a PIP or warning.",
        standard: "Treating 'poor performance' on equal footing with gross misconduct for instant termination bypasses standard notice periods and PIP safeguards.",
        lawyerLite: "Summary dismissal without notice or enquiry is strictly reserved for proven gross misconduct. Lumping subjective performance into summary termination is legally questionable.",
      },
      whyItMatters: "Allows instant dismissal without standard 90 days notice pay.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF management labels performance unsatisfactory", consequence: "THEN they terminate immediately without 90 days notice pay" },
      ],
      negotiable: true,
      counterLanguage: "Amend to: 'Termination for poor performance shall require a 30-day Performance Improvement Plan (PIP) and standard notice period.'",
      confidence: 0.95,
      verified: true,
      relatedClauseIds: ["clause-3"],
    },
  ],
  keyFacts: [
    { id: "fact-1", label: "Fixed CTC", value: "Rs. 17,40,000 / year", clauseId: "clause-4", verified: true, category: "amount" },
    { id: "fact-2", label: "Basic Monthly Salary", value: "Rs. 95,000 / month", clauseId: "clause-4", verified: true, category: "amount" },
    { id: "fact-3", label: "Probation Period", value: "6 months", clauseId: "clause-3", verified: true, category: "term" },
    { id: "fact-4", label: "Notice Period (Post-Probation)", value: "90 days written notice", clauseId: "clause-6", verified: true, category: "notice" },
    { id: "fact-5", label: "Non-Compete Duration", value: "24 months post-exit", clauseId: "clause-1", verified: true, category: "term" },
    { id: "fact-6", label: "Annual Leave", value: "15 days paid leave (no carry forward)", clauseId: "clause-5", verified: true, category: "term" },
  ],
  score: {
    total: 34,
    breakdown: [
      { category: "Non-compete", weight: 9, rawScore: 60, contribution: 54, notes: "24-month nationwide ban: high risk, benefits employer" },
      { category: "IP", weight: 8, rawScore: 60, contribution: 48, notes: "All outside work claimed: high risk, benefits employer" },
      { category: "Termination", weight: 12, rawScore: 60, contribution: 45, notes: "Immediate exit for performance without notice: high risk" },
      { category: "Probation", weight: 6, rawScore: 25, contribution: 15, notes: "7 vs 30 days asymmetric notice: medium risk" },
    ],
    verdict: "risky",
  },
  missingProtections: [
    { id: "e3", name: "Non-compete scope and duration", description: "Non-compete is unreasonable in scope (entire country, all tech)", critical: true },
    { id: "e4", name: "IP ownership clarity", description: "Carve-out for personal pre-existing or outside hobby work is missing", critical: true },
    { id: "e7", name: "Termination for cause definition", description: "Lack of PIP or notice protection for performance grounds", critical: true },
  ],
};

// ─── Freelance Contract Sample Analysis ───────────────────────────────────────
export const DEMO_FREELANCE_ANALYSIS: AnalysisResult = {
  id: "demo-freelance-001",
  isDemo: true,
  contentHash: "demo-freelance",
  analyzedAt: Date.now(),
  rawText: "Sample freelance agreement text",
  documentInfo: {
    type: "freelance",
    typeLabel: "Freelance Service Agreement",
    language: "English",
    jurisdiction: "Karnataka, India",
    parties: { you: "Rohan Kapoor (Freelancer)", them: "Brightwave Digital Pvt. Ltd." },
    detectedAt: Date.now(),
  },
  clauses: [
    {
      id: "clause-1",
      index: 0,
      title: "IP Retained Until Final Payment",
      verbatimQuote:
        "Upon receipt of full payment, all intellectual property rights in the deliverables shall be transferred to the Client. Until full payment is received, the Freelancer retains all rights. The Freelancer may display the work in their portfolio unless the Client requests otherwise in writing.",
      charStart: 0,
      charEnd: 250,
      category: "IP",
      risk: "low",
      plainMeaning: {
        simple: "You own all your code and designs until the client pays every rupee owed. You can also showcase the work in your portfolio.",
        standard: "Strong protection for the freelancer. Transfer of copyright is contingent upon full clearance of all milestone invoices.",
        lawyerLite: "Conditional intellectual property assignment creates a security interest in the deliverables, preserving remedies for non-payment.",
      },
      whyItMatters: "Protects you from client using your software without clearing the final invoice.",
      whoBenefits: "you",
      ifThenEffects: [
        { condition: "IF client does not pay invoice", consequence: "THEN client has zero legal right to use your code/deliverables" },
      ],
      negotiable: false,
      confidence: 0.98,
      verified: true,
      relatedClauseIds: ["clause-2"],
    },
    {
      id: "clause-2",
      index: 1,
      title: "25% Kill Fee on Client Cancellation",
      verbatimQuote:
        "If the Client terminates before completion: all work completed to date shall be delivered to the Client and the Client shall pay for work completed plus a kill fee of 25% of the remaining contract value.",
      charStart: 250,
      charEnd: 450,
      category: "Termination",
      risk: "low",
      plainMeaning: {
        simple: "If the client cancels mid-project, they must pay for all work you did so far PLUS an extra 25% penalty on the remaining project fee.",
        standard: "A favorable kill fee clause that compensates the freelancer for reserved calendar capacity if the client terminates early.",
        lawyerLite: "Enforceable liquidated damages clause tailored to professional services contracts.",
      },
      whyItMatters: "Guarantees you are not left uncompensated if a client changes their internal roadmap.",
      whoBenefits: "you",
      ifThenEffects: [
        { condition: "IF client cancels project halfway", consequence: "THEN they pay completed milestones + 25% of uncompleted balance" },
      ],
      negotiable: false,
      confidence: 0.96,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-3",
      index: 2,
      title: "Late Payment Interest at 18% Per Annum",
      verbatimQuote:
        "Invoices must be submitted within 7 days of each milestone. The Client shall pay within 30 days of invoice. Payments delayed beyond 30 days shall attract interest at 18% per annum.",
      charStart: 450,
      charEnd: 650,
      category: "Payment",
      risk: "medium",
      plainMeaning: {
        simple: "Payment term is Net-30 days. Delays attract 1.5% interest per month (18% annually).",
        standard: "Standard B2B payment terms. Net 30 is relatively long for a solo freelancer, but 18% interest discourages late payments.",
        lawyerLite: "Statutory MSMED Act interest rate for micro/small enterprises is 3x the RBI bank rate; 18% is standard contractual practice.",
      },
      whyItMatters: "You may need to wait up to 30 days after milestone completion to receive bank transfer.",
      whoBenefits: "both",
      ifThenEffects: [
        { condition: "IF client delays payment beyond 30 days", consequence: "THEN 18% p.a. interest is added to balance" },
      ],
      negotiable: true,
      counterLanguage: "Request Net-15 days for milestone payments to improve cash flow.",
      confidence: 0.95,
      verified: true,
      relatedClauseIds: [],
    },
    {
      id: "clause-4",
      index: 3,
      title: "Liability Capped at Total Fees Paid",
      verbatimQuote:
        "The Freelancer's total liability under this Agreement shall not exceed the total fees paid under this Agreement. Neither party shall be liable for indirect, consequential, or incidental damages.",
      charStart: 650,
      charEnd: 850,
      category: "Liability",
      risk: "low",
      plainMeaning: {
        simple: "If something goes wrong with the website, the maximum amount the client can ever sue you for is the ₹1,20,000 fee they paid you.",
        standard: "Mutual waiver of consequential damages with total liability capped at contract value. Excellent protection for the freelancer.",
        lawyerLite: "Standard limitation of liability clause shielding contractor from consequential commercial loss or business interruption claims.",
      },
      whyItMatters: "Protects your personal savings from massive corporate liability claims.",
      whoBenefits: "you",
      ifThenEffects: [
        { condition: "IF client claims revenue loss from website bugs", consequence: "THEN consequential damages are legally excluded" },
      ],
      negotiable: false,
      confidence: 0.97,
      verified: true,
      relatedClauseIds: [],
    },
  ],
  keyFacts: [
    { id: "fact-1", label: "Total Project Fee", value: "Rs. 1,20,000", clauseId: "clause-3", verified: true, category: "amount" },
    { id: "fact-2", label: "Upfront Advance", value: "Rs. 30,000 on signing", clauseId: "clause-3", verified: true, category: "amount" },
    { id: "fact-3", label: "Final Delivery Deadline", value: "1 March 2024", clauseId: "clause-3", verified: true, category: "date" },
    { id: "fact-4", label: "Revisions Included", value: "Up to 3 rounds", clauseId: "clause-3", verified: true, category: "term" },
    { id: "fact-5", label: "Payment Window", value: "Net 30 days from invoice", clauseId: "clause-3", verified: true, category: "date" },
  ],
  score: {
    total: 82,
    breakdown: [
      { category: "IP", weight: 8, rawScore: 0, contribution: 0, notes: "Freelancer retains IP until full payment: very fair" },
      { category: "Liability", weight: 10, rawScore: 0, contribution: 0, notes: "Liability strictly capped at contract value: very fair" },
      { category: "Payment", weight: 10, rawScore: 25, contribution: 12.5, notes: "30-day payment lag: moderate wait" },
    ],
    verdict: "very-fair",
  },
  missingProtections: [],
};

// ─── Personal Loan Sample Analysis ───────────────────────────────────────────
export const DEMO_LOAN_ANALYSIS: AnalysisResult = {
  id: "demo-loan-001",
  isDemo: true,
  contentHash: "demo-loan",
  analyzedAt: Date.now(),
  rawText: "Sample personal loan agreement text",
  documentInfo: {
    type: "loan",
    typeLabel: "Personal Loan Agreement",
    language: "English",
    jurisdiction: "India",
    parties: { you: "Deepak Verma (Borrower)", them: "QuickFunds Finance Pvt. Ltd." },
    detectedAt: Date.now(),
  },
  clauses: [
    {
      id: "clause-1",
      index: 0,
      title: "Variable 24% Interest & 15-Day Exit Repayment",
      verbatimQuote:
        "The loan shall carry interest at 24% per annum (2% per month), calculated on the reducing balance method. The interest rate is variable and the Lender may revise it with 30 days' notice. If the revised rate is not acceptable, the Borrower must repay the outstanding amount within 15 days of notice.",
      charStart: 0,
      charEnd: 300,
      category: "Payment",
      risk: "high",
      plainMeaning: {
        simple: "Interest rate is already very high (24%), and the lender can increase it anytime. If you disagree with the hike, you must pay back the entire remaining loan in just 15 days.",
        standard: "The lender retains unilateral power to increase the interest rate. If you reject the revision, an onerous acceleration clause forces full repayment within 15 days.",
        lawyerLite: "Unilateral interest variation clause. Forcing full prepayment within 15 days upon rate revision is predatory and poses severe liquidity risk.",
      },
      whyItMatters: "You could suddenly be forced to arrange ₹4–5 lakhs in 15 days if the lender raises rates.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF lender raises rate from 24% to 30%", consequence: "THEN you must either accept or pay entire ₹5 lakh balance in 15 days" },
      ],
      negotiable: true,
      counterLanguage: "Demand: Fixed interest rate for the entire 24-month duration.",
      confidence: 0.98,
      verified: true,
      relatedClauseIds: ["clause-2"],
    },
    {
      id: "clause-2",
      index: 1,
      title: "Immediate Acceleration on 7 Days Delay",
      verbatimQuote:
        "The Borrower shall be in default if: (a) any instalment is unpaid for more than 7 days... Upon default, the entire outstanding loan amount, including interest, penalties, and all fees, shall become immediately due and payable without any further notice.",
      charStart: 300,
      charEnd: 550,
      category: "Acceleration",
      risk: "high",
      plainMeaning: {
        simple: "If you are just 7 days late on ONE monthly payment, the lender can demand you pay back the ENTIRE remaining loan immediately.",
        standard: "Hair-trigger acceleration clause: missing a single EMI by 7 days triggers complete recall of the loan principal and interest.",
        lawyerLite: "Aggressive acceleration provision. Standard banking practice requires at least 60-90 days of continuous non-payment (NPA classification) before full loan recall.",
      },
      whyItMatters: "A banking holiday or temporary salary delay could cause complete loan recall and cheque encashment.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF EMI is delayed 8 days", consequence: "THEN entire ₹5,00,000 becomes due immediately" },
      ],
      negotiable: true,
      counterLanguage: "Amend grace period from 7 days to at least 30-60 days before default acceleration.",
      confidence: 0.97,
      verified: true,
      relatedClauseIds: ["clause-3"],
    },
    {
      id: "clause-3",
      index: 2,
      title: "Waiver of Court Access & Sole Arbitrator Appointment",
      verbatimQuote:
        "All disputes shall be resolved by a sole arbitrator appointed exclusively by the Lender in Bengaluru. The Borrower waives the right to approach any court for any relief connected to this Agreement. All arbitration costs shall be borne by the Borrower.",
      charStart: 550,
      charEnd: 800,
      category: "Dispute Resolution",
      risk: "unusual",
      plainMeaning: {
        simple: "You waive your right to go to court. The lender picks the arbitrator, and YOU have to pay all the arbitration fees.",
        standard: "One-sided dispute clause forcing private arbitration where the lender appoints the arbitrator and the borrower pays 100% of the costs.",
        lawyerLite: "Unilateral appointment of arbitrators is contrary to Section 12(5) of the Arbitration and Conciliation Act (Perkins Eastman Architects). Total waiver of court remedies is void under Section 28 of the Contract Act.",
      },
      whyItMatters: "Designed to deter you from challenging unfair loan terms or illegal recovery practices.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF a dispute occurs", consequence: "THEN lender picks arbitrator and bills you for all arbitration fees" },
      ],
      negotiable: false,
      confidence: 0.96,
      verified: true,
      relatedClauseIds: [],
    },
  ],
  keyFacts: [
    { id: "fact-1", label: "Loan Amount", value: "Rs. 5,00,000", clauseId: "clause-1", verified: true, category: "amount" },
    { id: "fact-2", label: "Interest Rate", value: "24% per annum (variable)", clauseId: "clause-1", verified: true, category: "amount" },
    { id: "fact-3", label: "Monthly EMI", value: "Rs. 25,840 for 24 months", clauseId: "clause-2", verified: true, category: "amount" },
    { id: "fact-4", label: "Processing Fee", value: "Rs. 15,000 (3% deducted upfront)", clauseId: "clause-1", verified: true, category: "amount" },
    { id: "fact-5", label: "Prepayment Penalty", value: "5% of outstanding balance", clauseId: "clause-1", verified: true, category: "penalty" },
  ],
  score: {
    total: 21,
    breakdown: [
      { category: "Acceleration", weight: 9, rawScore: 60, contribution: 54, notes: "7-day hair-trigger acceleration: extreme risk" },
      { category: "Payment", weight: 10, rawScore: 60, contribution: 50, notes: "Variable 24% + 15-day exit clause: high risk" },
      { category: "Dispute Resolution", weight: 7, rawScore: 45, contribution: 31.5, notes: "Borrower pays 100% fees + lender picks judge: unusual" },
    ],
    verdict: "very-risky",
  },
  missingProtections: [
    { id: "l1", name: "Fixed interest protection", description: "Unilateral interest revision without fair exit terms", critical: true },
    { id: "l5", name: "Standard default cure window", description: "7-day default acceleration is dangerously short", critical: true },
  ],
};

// ─── App Terms Sample Analysis ───────────────────────────────────────────────
export const DEMO_APPTERMS_ANALYSIS: AnalysisResult = {
  id: "demo-appterms-001",
  isDemo: true,
  contentHash: "demo-appterms",
  analyzedAt: Date.now(),
  rawText: "Sample app terms of service text",
  documentInfo: {
    type: "terms",
    typeLabel: "Terms of Service & Privacy Policy",
    language: "English",
    jurisdiction: "Karnataka, India",
    parties: { you: "App User", them: "Petal Technologies Pvt. Ltd." },
    detectedAt: Date.now(),
  },
  clauses: [
    {
      id: "clause-1",
      index: 0,
      title: "Perpetual Commercial Licence on User Notes & Tasks",
      verbatimQuote:
        "By uploading or creating content in the App, you grant Petal Technologies a worldwide, perpetual, irrevocable, royalty-free, sublicensable licence to use, reproduce, modify, adapt, publish, translate, distribute, and create derivative works from your content for any purpose, including commercial purposes, without compensation to you.",
      charStart: 0,
      charEnd: 300,
      category: "Privacy",
      risk: "high",
      plainMeaning: {
        simple: "Any personal notes, ideas, tasks, or documents you type into the app can be used, sold, published, or commercialised by the company forever without paying you.",
        standard: "An overbroad content license. Instead of asking for rights strictly necessary to operate the service, the company claims perpetual commercial exploitation rights over your private thoughts and data.",
        lawyerLite: "Inappropriate broad IP grant in personal productivity software. Should be limited to host, store, and display content solely for providing the core app functionality.",
      },
      whyItMatters: "Your proprietary business notes or personal journaling can be legally repurposed or trained upon by the developer.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF you write private notes in TaskFlow", consequence: "THEN Petal Technologies has worldwide rights to use and sublicense them commercially" },
      ],
      negotiable: false,
      confidence: 0.98,
      verified: true,
      relatedClauseIds: ["clause-2"],
    },
    {
      id: "clause-2",
      index: 1,
      title: "Data Shared with Third Parties Without Court Order",
      verbatimQuote:
        "We may share your personal data with: (a) our parent company, subsidiaries, and affiliates; (b) third-party advertising partners; (c) service providers who may further share data; (d) any buyer in case of merger or acquisition, without notice to you; (e) government authorities when requested, without requiring a court order.",
      charStart: 300,
      charEnd: 600,
      category: "Data Collection",
      risk: "high",
      plainMeaning: {
        simple: "They share your data with advertisers, affiliates, and will hand your data over to authorities immediately upon request without requiring a warrant or court order.",
        standard: "Extreme privacy exposure. Conceding data to authorities without judicial process and permitting third-party onward data sharing undermines your statutory data protection rights.",
        lawyerLite: "Violates fundamental privacy expectations under India's Digital Personal Data Protection Act (DPDP Act 2023) regarding purpose limitation and lawful access.",
      },
      whyItMatters: "Zero confidentiality for your contacts, continuous location, and personal notes.",
      whoBenefits: "them",
      ifThenEffects: [
        { condition: "IF government requests your account data", consequence: "THEN company hands it over without requiring a warrant or court order" },
      ],
      negotiable: false,
      confidence: 0.97,
      verified: true,
      relatedClauseIds: [],
    },
  ],
  keyFacts: [
    { id: "fact-1", label: "Monthly Subscription", value: "Rs. 499 / month (Auto-renews)", clauseId: "clause-1", verified: true, category: "amount" },
    { id: "fact-2", label: "Refund Policy", value: "Zero refunds under any circumstances", clauseId: "clause-1", verified: true, category: "penalty" },
    { id: "fact-3", label: "Account Deletion", value: "Data purged in 30 days on termination", clauseId: "clause-2", verified: true, category: "term" },
    { id: "fact-4", label: "Class Action Waiver", value: "Mandatory individual arbitration", clauseId: "clause-2", verified: true, category: "forum" },
  ],
  score: {
    total: 31,
    breakdown: [
      { category: "Privacy", weight: 8, rawScore: 60, contribution: 48, notes: "Perpetual commercial license on user content: high risk" },
      { category: "Data Collection", weight: 8, rawScore: 60, contribution: 48, notes: "Government disclosure without court order: high risk" },
    ],
    verdict: "risky",
  },
  missingProtections: [
    { id: "t1", name: "Data collection scope limitation", description: "Collects continuous location and contacts without necessity", critical: true },
    { id: "t4", name: "Class action waiver / arbitration", description: "Strips consumer right to judicial dispute resolution", critical: true },
  ],
};

export function getSampleAnalysisById(sampleId: string): AnalysisResult {
  switch (sampleId) {
    case "employment":
      return DEMO_EMPLOYMENT_ANALYSIS;
    case "freelance":
      return DEMO_FREELANCE_ANALYSIS;
    case "loan":
      return DEMO_LOAN_ANALYSIS;
    case "appterms":
      return DEMO_APPTERMS_ANALYSIS;
    case "rental":
    default:
      return DEMO_RENTAL_ANALYSIS;
  }
}
