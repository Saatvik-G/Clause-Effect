import { z } from "zod";

/**
 * Validates environment variables at application startup.
 * Fail fast with actionable error messages.
 */
export const EnvSchema = z.object({
  GEMINI_API_KEY: z
    .string()
    .min(1, "GEMINI_API_KEY must be provided for live AI analysis.")
    .optional(),
  GEMINI_MODEL: z.string().default("gemini-3.6-flash"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(rawEnv: Record<string, string | undefined> = process.env): Env {
  const result = EnvSchema.safeParse(rawEnv);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`Environment configuration error: ${errors}`);
  }
  return result.data;
}

export const env = validateEnv();
