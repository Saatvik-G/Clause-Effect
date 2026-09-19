import { describe, it, expect, vi, beforeEach } from "vitest";
import { callGeminiWithRetry } from "@/lib/ai/client";
import { z } from "zod";

describe("API Pipeline & Retry Engine with Mocked LLM (Testing Criterion 3.5)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully parses valid structured LLM responses", async () => {
    const mockSchema = z.object({ title: z.string(), score: z.number() });
    const mockCall = vi.fn().mockResolvedValue(JSON.stringify({ title: "Valid Agreement", score: 85 }));

    const result = await callGeminiWithRetry(
      "test prompt",
      "system instruction",
      (text) => mockSchema.parse(JSON.parse(text)),
      5000,
      mockCall
    );

    expect(result.title).toBe("Valid Agreement");
    expect(result.score).toBe(85);
    expect(mockCall).toHaveBeenCalledTimes(1);
  });

  it("retries when LLM outputs markdown-wrapped JSON or malformed schema", async () => {
    const mockSchema = z.object({ value: z.string() });
    const mockCall = vi
      .fn()
      .mockResolvedValueOnce("INVALID NON-JSON OUTPUT")
      .mockResolvedValueOnce(JSON.stringify({ value: "recovered-after-retry" }));

    const result = await callGeminiWithRetry(
      "test prompt",
      "system instruction",
      (text) => mockSchema.parse(JSON.parse(text)),
      5000,
      mockCall
    );

    expect(result.value).toBe("recovered-after-retry");
    expect(mockCall).toHaveBeenCalledTimes(2);
  });

  it("handles markdown code block wrappers ```json ... ``` gracefully", async () => {
    const mockSchema = z.object({ status: z.string() });
    const markdownWrapped = "```json\n{\n  \"status\": \"success\"\n}\n```";
    const mockCall = vi.fn().mockResolvedValue(markdownWrapped);

    const result = await callGeminiWithRetry(
      "test prompt",
      "system instruction",
      (text) => mockSchema.parse(JSON.parse(text)),
      5000,
      mockCall
    );

    expect(result.status).toBe("success");
  });

  it("throws formatted error when retries are exhausted", async () => {
    const mockSchema = z.object({ expected: z.number() });
    const mockCall = vi.fn().mockResolvedValue("bad data");

    await expect(
      callGeminiWithRetry(
        "test prompt",
        "system instruction",
        (text) => mockSchema.parse(JSON.parse(text)),
        5000,
        mockCall
      )
    ).rejects.toThrow(/Gemini call failed after 2 attempts/);
    expect(mockCall).toHaveBeenCalledTimes(2);
  });
});
