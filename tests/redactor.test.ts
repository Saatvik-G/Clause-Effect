import { describe, it, expect } from "vitest";
import { redactPII, countPIIMatches } from "@/lib/pipeline/redactor";

describe("redactPII", () => {
  it("redacts email addresses", () => {
    const result = redactPII("Contact me at john.doe@example.com for details.");
    expect(result.redactedText).toContain("[EMAIL REDACTED]");
    expect(result.redactedText).not.toContain("john.doe@example.com");
    expect(result.count).toBeGreaterThan(0);
  });

  it("redacts Indian mobile numbers", () => {
    const result = redactPII("Call me at 9876543210 or +91 98765 43210.");
    expect(result.redactedText).toContain("[PHONE REDACTED]");
    expect(result.redactedText).not.toContain("9876543210");
  });

  it("redacts Aadhaar-like 12-digit numbers", () => {
    const result = redactPII("Aadhaar: 1234 5678 9012");
    expect(result.redactedText).toContain("[ID REDACTED]");
  });

  it("redacts PAN numbers", () => {
    const result = redactPII("PAN: ABCDE1234F");
    expect(result.redactedText).toContain("[PAN REDACTED]");
  });

  it("does not redact regular text", () => {
    const text = "The tenant shall pay Rs. 28,000 per month.";
    const result = redactPII(text);
    expect(result.redactedText).toBe(text);
    expect(result.count).toBe(0);
  });

  it("returns count of redacted items", () => {
    const result = redactPII("Email: test@test.com, Phone: 9988776655");
    expect(result.count).toBe(2);
  });
});

describe("countPIIMatches", () => {
  it("counts multiple PII items", () => {
    const count = countPIIMatches("test@test.com and 9876543210 and ABCDE1234F");
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it("returns 0 for clean text", () => {
    const count = countPIIMatches("No sensitive information here.");
    expect(count).toBe(0);
  });
});
