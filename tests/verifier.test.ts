import { describe, it, expect } from "vitest";
import { verifyQuote, verifyClause, verifyValueInSource } from "@/lib/pipeline/verifier";

describe("verifyQuote", () => {
  const source = "This Agreement shall be governed by the laws of Karnataka, India. The Tenant shall pay rent on the 5th of each month.";

  it("returns true for exact match", () => {
    expect(verifyQuote("governed by the laws of Karnataka", source)).toBe(true);
  });

  it("returns true for case-insensitive match", () => {
    expect(verifyQuote("GOVERNED BY THE LAWS OF KARNATAKA", source)).toBe(true);
  });

  it("returns true for whitespace-normalised match", () => {
    expect(verifyQuote("laws  of  Karnataka", source)).toBe(true);
  });

  it("returns false for fabricated text", () => {
    expect(verifyQuote("governed by Maharashtra law", source)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(verifyQuote("", source)).toBe(false);
  });

  it("returns false for very short string", () => {
    expect(verifyQuote("hi", source)).toBe(false);
  });
});

describe("verifyClause", () => {
  const source = "The Tenant shall pay monthly rent of Rs. 28,000 on or before the 5th of each month.";

  it("marks clause as verified when quote matches", () => {
    const result = verifyClause({ verbatimQuote: "shall pay monthly rent of Rs. 28,000" }, source);
    expect(result.verified).toBe(true);
    expect(result.unverifiedFields).toHaveLength(0);
  });

  it("marks clause as unverified when quote doesn't match", () => {
    const result = verifyClause({ verbatimQuote: "pay rent of Rs. 50,000" }, source);
    expect(result.verified).toBe(false);
    expect(result.unverifiedFields).toContain("verbatimQuote");
  });
});

describe("verifyValueInSource", () => {
  const source = "Monthly rent: Rs. 28,000. Notice period: 2 months.";

  it("returns true for a value present in source", () => {
    expect(verifyValueInSource("28,000", source)).toBe(true);
  });

  it("returns true for short values (skips check)", () => {
    expect(verifyValueInSource("x", source)).toBe(true);
  });

  it("returns false for values not in source", () => {
    expect(verifyValueInSource("50,000", source)).toBe(false);
  });
});
