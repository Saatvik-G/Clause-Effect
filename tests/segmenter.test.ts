import { describe, it, expect } from "vitest";
import { segmentDocument } from "@/lib/pipeline/segmenter";

describe("segmentDocument", () => {
  const sampleDoc = `RESIDENTIAL TENANCY AGREEMENT

1. PROPERTY
The Landlord agrees to rent Flat 3B to Tenant.

2. TERM AND RENEWAL
The tenancy shall commence on 1st March 2024 for 11 months.

3. RENT PAYMENT
The monthly rent is Rs. 28,000 payable by 5th.

4. SECURITY DEPOSIT
Tenant pays Rs. 1,68,000 as refundable deposit.`;

  it("extracts clauses with stable IDs and titles", () => {
    const segments = segmentDocument(sampleDoc);
    expect(segments.length).toBe(4);
    expect(segments[0].id).toBe("clause-1");
    expect(segments[0].title).toBe("1. PROPERTY");
    expect(segments[1].id).toBe("clause-2");
    expect(segments[1].title).toBe("2. TERM AND RENEWAL");
    expect(segments[2].id).toBe("clause-3");
    expect(segments[3].id).toBe("clause-4");
  });

  it("calculates accurate character offsets", () => {
    const segments = segmentDocument(sampleDoc);
    for (const seg of segments) {
      expect(seg.charStart).toBeGreaterThanOrEqual(0);
      expect(seg.charEnd).toBeGreaterThan(seg.charStart);
      const extractedSlice = sampleDoc.slice(seg.charStart, seg.charEnd).trim();
      expect(extractedSlice).toContain(seg.title);
    }
  });

  it("handles empty or whitespace documents gracefully", () => {
    expect(segmentDocument("")).toEqual([]);
    expect(segmentDocument("   \n\n  ")).toEqual([]);
  });

  it("falls back to paragraph splitting if no numbered clauses exist", () => {
    const unnumberedDoc = `This is the first paragraph describing the general arrangement between parties.

This is the second paragraph specifying the payment obligations and bank wire details.

This is the third paragraph detailing notice and termination policies.`;

    const segments = segmentDocument(unnumberedDoc);
    expect(segments.length).toBe(3);
    expect(segments[0].id).toBe("clause-1");
    expect(segments[1].id).toBe("clause-2");
    expect(segments[2].id).toBe("clause-3");
  });
});
