import type { Clause, DocumentType, MissingProtection } from "@/lib/types";
import rentalChecklist from "../../../data/checklists/rental.json";
import employmentChecklist from "../../../data/checklists/employment.json";
import ndaChecklist from "../../../data/checklists/nda.json";
import loanChecklist from "../../../data/checklists/loan.json";
import freelanceChecklist from "../../../data/checklists/freelance.json";
import termsChecklist from "../../../data/checklists/terms.json";
import insuranceChecklist from "../../../data/checklists/insurance.json";

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  critical: boolean;
}

interface Checklist {
  type: string;
  protections: ChecklistItem[];
}

const CHECKLISTS: Record<string, Checklist> = {
  rental: rentalChecklist as Checklist,
  employment: employmentChecklist as Checklist,
  nda: ndaChecklist as Checklist,
  loan: loanChecklist as Checklist,
  freelance: freelanceChecklist as Checklist,
  terms: termsChecklist as Checklist,
  insurance: insuranceChecklist as Checklist,
};

/**
 * Check which protections from the static checklist are absent from the
 * extracted clauses. Uses keyword matching on clause titles and categories.
 */
export function checkMissingProtections(
  docType: DocumentType,
  clauses: Clause[],
  rawText: string
): MissingProtection[] {
  const checklist = CHECKLISTS[docType];
  if (!checklist) return [];

  const clauseText = clauses
    .map((c) => `${c.title} ${c.category} ${c.verbatimQuote}`.toLowerCase())
    .join(" ");
  const textLower = rawText.toLowerCase();
  const searchText = clauseText + " " + textLower;

  const missing: MissingProtection[] = [];

  for (const item of checklist.protections) {
    const keywords = item.name
      .toLowerCase()
      .split(/[\s\/,]+/)
      .filter((w) => w.length > 3);

    // Item is present if at least 2 significant keywords appear in document
    const matchCount = keywords.filter((kw) => searchText.includes(kw)).length;
    const threshold = Math.max(1, Math.floor(keywords.length * 0.5));

    if (matchCount < threshold) {
      missing.push({
        id: item.id,
        name: item.name,
        description: item.description,
        critical: item.critical,
      });
    }
  }

  return missing;
}
