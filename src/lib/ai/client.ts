import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not set. Add it to .env.local"
      );
    }
    _client = new GoogleGenAI({ apiKey });
  }
  return _client;
}

export function getModelName(): string {
  return process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
}

export function hasApiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Wraps a Gemini generateContent call with retry on Zod validation failure.
 * Returns the raw text from the model.
 */
export async function callGemini(
  prompt: string,
  systemInstruction: string,
  timeoutMs = 45000
): Promise<string> {
  const client = getGeminiClient();
  const modelName = getModelName();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.1, // low temperature for consistency
        responseMimeType: "application/json",
      },
    });
    clearTimeout(timer);
    const text = response.text ?? "";
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Call with automatic retry on validation failure.
 * validator: fn that parses the text and returns T or throws
 */
export async function callGeminiWithRetry<T>(
  prompt: string,
  systemInstruction: string,
  validator: (text: string) => T,
  timeoutMs = 45000,
  callFn: (prompt: string, sys: string, timeout: number) => Promise<string> = callGemini
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callFn(
        attempt === 0
          ? prompt
          : `${prompt}\n\nPrevious attempt failed validation: ${String(lastError)}. Return valid JSON only.`,
        systemInstruction,
        timeoutMs
      );

      // Strip markdown code fences if present
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      return validator(cleaned);
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        console.warn("[gemini] Attempt 1 failed, retrying:", err);
      }
    }
  }

  throw new Error(
    `Gemini call failed after 2 attempts: ${String(lastError)}`
  );
}
