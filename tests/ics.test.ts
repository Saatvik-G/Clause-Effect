import { describe, it, expect } from "vitest";
import { generateICS } from "@/lib/utils/ics";

describe("generateICS", () => {
  it("creates a valid iCalendar structure with events", () => {
    const ics = generateICS([
      {
        title: "Lease Non-Renewal Notice Deadline",
        description: "Must send written notice 60 days prior to expiry.",
        dateStr: "2024-11-01",
      },
      {
        title: "Rent Payment Due Date",
        description: "Pay Rs. 28,000 before 5th of each month to avoid Rs. 500/day penalty.",
        dateStr: "2024-04-05",
      },
    ]);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Clause & Effect//Legal Deadlines//EN");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Lease Non-Renewal Notice Deadline");
    expect(ics).toContain("DTSTART;VALUE=DATE:20241101");
    expect(ics).toContain("SUMMARY:Rent Payment Due Date");
    expect(ics).toContain("DTSTART;VALUE=DATE:20240405");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("handles events with special characters safely", () => {
    const ics = generateICS([
      {
        title: "Meeting with Landlord; Review Terms, Taxes & Penalties",
        description: "Notes:\n1. Deposit refund\n2. Repairs",
        dateStr: "2024-05-10",
      },
    ]);

    expect(ics).toContain("SUMMARY:Meeting with Landlord\\; Review Terms\\, Taxes & Penalties");
    expect(ics).toContain("DESCRIPTION:Notes:\\n1. Deposit refund\\n2. Repairs");
  });

  it("gracefully ignores invalid date strings", () => {
    const ics = generateICS([
      {
        title: "Invalid Event",
        description: "No date provided",
        dateStr: "invalid-date",
      },
    ]);

    expect(ics).not.toContain("BEGIN:VEVENT");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
  });
});
