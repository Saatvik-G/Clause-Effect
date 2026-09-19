import { describe, it, expect } from "vitest";
import { EnvSchema, validateEnv } from "@/lib/env";
import {
  ClauseAnalysisSchema,
  DocumentTypeSchema,
  AskResponseSchema,
  CompareResponseSchema,
  NavigateResponseSchema,
} from "@/lib/ai/schemas";

describe("Schema Validation (Code Quality Criterion 3.2 & Testing 3.5)", () => {
  describe("Environment Schema", () => {
    it("validates valid environment variables", () => {
      const valid = {
        GEMINI_API_KEY: "test-api-key",
        GEMINI_MODEL: "gemini-3.6-flash",
        NODE_ENV: "production",
      };
      const parsed = validateEnv(valid);
      expect(parsed.GEMINI_API_KEY).toBe("test-api-key");
      expect(parsed.GEMINI_MODEL).toBe("gemini-3.6-flash");
      expect(parsed.NODE_ENV).toBe("production");
    });

    it("defaults GEMINI_MODEL when omitted", () => {
      const parsed = EnvSchema.parse({});
      expect(parsed.GEMINI_MODEL).toBe("gemini-3.6-flash");
    });

    it("throws on invalid NODE_ENV", () => {
      expect(() => {
        validateEnv({ NODE_ENV: "invalid-env" as unknown as string });
      }).toThrow(/Environment configuration error/);
    });
  });

  describe("DocumentTypeSchema", () => {
    it("accepts known legal document types", () => {
      expect(DocumentTypeSchema.parse("rental")).toBe("rental");
      expect(DocumentTypeSchema.parse("employment")).toBe("employment");
      expect(DocumentTypeSchema.parse("nda")).toBe("nda");
      expect(DocumentTypeSchema.parse("loan")).toBe("loan");
      expect(DocumentTypeSchema.parse("freelance")).toBe("freelance");
      expect(DocumentTypeSchema.parse("terms")).toBe("terms");
    });

    it("rejects unknown document types", () => {
      expect(() => DocumentTypeSchema.parse("random-novel")).toThrow();
    });
  });

  describe("ClauseAnalysisSchema", () => {
    it("accepts well-formed clause analysis", () => {
      const validClause = {
        id: "clause-1",
        title: "Security Deposit",
        verbatimQuote: "Tenant shall deposit Rs 1,00,000 as security.",
        category: "deposit",
        risk: "medium",
        plainMeaning: {
          simple: "You pay an upfront deposit of 1 lakh.",
          standard: "A refundable security deposit of Rs 1,00,000 is required upon signing.",
          lawyerLite: "Security deposit obligation pursuant to tenancy terms.",
        },
        whyItMatters: "Large lock-in of capital before moving in.",
        whoBenefits: "them",
        ifThenEffects: [
          {
            condition: "If you cause damage",
            consequence: "Landlord deducts costs from deposit",
          },
        ],
        negotiable: true,
        confidence: 0.95,
        relatedClauseIds: [],
        counterLanguage: "Deposit shall be refunded within 14 days of lease termination.",
      };

      const result = ClauseAnalysisSchema.safeParse(validClause);
      expect(result.success).toBe(true);
    });

    it("rejects clause with invalid ID format", () => {
      const invalid = {
        id: "invalid_id_format",
        title: "Test",
        verbatimQuote: "Quote",
        category: "misc",
        risk: "low",
        plainMeaning: { simple: "a", standard: "b", lawyerLite: "c" },
        whyItMatters: "matters",
        whoBenefits: "you",
        ifThenEffects: [],
        negotiable: false,
        confidence: 0.9,
        relatedClauseIds: [],
      };
      expect(ClauseAnalysisSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("AskResponseSchema", () => {
    it("validates answerable response structure", () => {
      const ans = {
        answer: "The rent is Rs 28,000 per month.",
        clauseIds: ["clause-1"],
        confidence: 0.95,
        notAddressed: false,
      };
      expect(AskResponseSchema.safeParse(ans).success).toBe(true);
    });

    it("validates unanswerable refusal structure", () => {
      const refusal = {
        answer: "This document does not contain that information.",
        clauseIds: [],
        confidence: 0.1,
        notAddressed: true,
      };
      expect(AskResponseSchema.safeParse(refusal).success).toBe(true);
    });
  });

  describe("CompareResponseSchema", () => {
    it("validates comparison alignment structure", () => {
      const compareData = {
        diffs: [
          {
            id: "diff-1",
            changeType: "shifted-toward-you",
            clauseV1Id: "c1",
            clauseV2Id: "c1",
            explanation: "Reduced security deposit obligation",
            significance: "major",
          },
        ],
        verdict: {
          netEffect: "better-for-you",
          summary: "Version 2 reduces the security deposit from 6 months to 2 months.",
          majorChanges: 1,
          shiftsTowardThem: 0,
          shiftsTowardYou: 1,
        },
      };
      expect(CompareResponseSchema.safeParse(compareData).success).toBe(true);
    });
  });

  describe("NavigateResponseSchema", () => {
    it("validates roadmap response structure", () => {
      const navData = {
        redFlags: ["Unilateral lease termination clause"],
        actionTickets: [
          {
            id: "act-1",
            what: "Request receipt for deposit payment",
            by: "Before move-in",
            who: "Landlord",
            carry: ["Bank transfer confirmation"],
            priority: "urgent",
          },
        ],
        questionsBeforeSigning: ["Is maintenance included in the rent?"],
        questionsForLawyer: ["Is the 6-month lock-in legally standard?"],
        deadlines: [
          {
            label: "Monthly rent payment",
            date: "5th of every month",
          },
        ],
      };
      expect(NavigateResponseSchema.safeParse(navData).success).toBe(true);
    });
  });
});
