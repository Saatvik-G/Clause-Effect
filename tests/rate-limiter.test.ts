import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/utils/rate-limiter";

describe("Rate Limiter (Security Criterion 3.3 & Testing 3.5)", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows normal requests within quota", () => {
    const res1 = checkRateLimit("judge-ip", { maxRequests: 5 });
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(4);

    const res2 = checkRateLimit("judge-ip", { maxRequests: 5 });
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(3);
  });

  it("allows 10+ normal judge requests when configured with default limit (30)", () => {
    for (let i = 0; i < 15; i++) {
      const res = checkRateLimit("judge-ip");
      expect(res.allowed).toBe(true);
    }
  });

  it("blocks requests exceeding maximum threshold", () => {
    const opts = { maxRequests: 3 };
    expect(checkRateLimit("spammer", opts).allowed).toBe(true);
    expect(checkRateLimit("spammer", opts).allowed).toBe(true);
    expect(checkRateLimit("spammer", opts).allowed).toBe(true);

    const blocked = checkRateLimit("spammer", opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("isolates rate limits per identifier / IP", () => {
    const opts = { maxRequests: 2 };
    checkRateLimit("user-a", opts);
    checkRateLimit("user-a", opts);
    expect(checkRateLimit("user-a", opts).allowed).toBe(false);

    // user-b should still be allowed
    expect(checkRateLimit("user-b", opts).allowed).toBe(true);
  });
});
