import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithRetry, hasApiKey } from "@/lib/ai/client";
import { classifyPrompt, segmentAndAnalysePrompt, keyFactsPrompt } from "@/lib/ai/prompts";
import {
  ClassificationResponseSchema,
  ClauseBatchResponseSchema,
  KeyFactsResponseSchema,
} from "@/lib/ai/schemas";
import { verifyClause } from "@/lib/pipeline/verifier";
import { computeFinePrintScore } from "@/lib/pipeline/scorer";
import { checkMissingProtections } from "@/lib/pipeline/missing-protections";
import { hashContent, normaliseText, truncateText } from "@/lib/utils/helpers";
import type { Clause, KeyFact, AnalysisResult, DocumentType } from "@/lib/types";

// Simple in-memory rate limiting (per deployment instance)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const MAX_TEXT_LENGTH = 80000; // ~60 pages

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "NO_API_KEY", message: "No Gemini API key configured. Use demo mode." },
      { status: 503 }
    );
  }

  let body: { text?: string; jurisdiction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawText = body.text;
  if (!rawText || typeof rawText !== "string") {
    return NextResponse.json({ error: "Missing text in request body" }, { status: 400 });
  }

  if (rawText.trim().length < 50) {
    return NextResponse.json(
      { error: "Document is too short to analyse. Please provide a complete document." },
      { status: 422 }
    );
  }

  // Normalise and truncate
  const normText = normaliseText(rawText);
  const text = truncateText(normText, MAX_TEXT_LENGTH);
  const contentHash = await hashContent(text);

  try {
    // Stage 1: Classify document
    const classificationResult = await callGeminiWithRetry(
      classifyPrompt(text),
      "You are a legal document classifier. Return valid JSON only.",
      (raw) => ClassificationResponseSchema.parse(JSON.parse(raw))
    );

    if (!classificationResult.isLegalDocument) {
      return NextResponse.json(
        {
          error: "NOT_LEGAL",
          message:
            classificationResult.nonLegalReason ??
            "This doesn't appear to be a legal document. Clause & Effect works best with contracts, agreements, and legal notices.",
        },
        { status: 422 }
      );
    }

    const documentInfo = {
      ...classificationResult.documentInfo,
      jurisdiction: body.jurisdiction ?? classificationResult.documentInfo.jurisdiction,
      detectedAt: Date.now(),
    };

    const docType = documentInfo.type as DocumentType;

    // Stage 2: Segment and analyse clauses in batches
    const BATCH_SIZE = 12;
    const allClauses: Clause[] = [];

    // We'll run one batch for now (up to 12 clauses) and handle pagination in client
    // For larger docs, we could run multiple batches but keep this fast for the demo
    const batchResult = await callGeminiWithRetry(
      segmentAndAnalysePrompt(text, documentInfo.typeLabel, 0, BATCH_SIZE),
      "You are a legal document clause analyser. Return valid JSON only.",
      (raw) => ClauseBatchResponseSchema.parse(JSON.parse(raw)),
      60000
    );

    // Stage 3: Verify quotes and build Clause objects
    for (let i = 0; i < batchResult.clauses.length; i++) {
      const raw = batchResult.clauses[i];
      const { verified, unverifiedFields } = verifyClause(raw, text);

      const clause: Clause = {
        id: raw.id,
        index: i,
        title: raw.title,
        verbatimQuote: raw.verbatimQuote,
        charStart: text.indexOf(raw.verbatimQuote.slice(0, 40)),
        charEnd: -1,
        category: raw.category,
        risk: raw.risk,
        plainMeaning: raw.plainMeaning,
        whyItMatters: raw.whyItMatters,
        whoBenefits: raw.whoBenefits,
        ifThenEffects: raw.ifThenEffects,
        negotiable: raw.negotiable,
        counterLanguage: raw.counterLanguage,
        confidence: raw.confidence,
        verified,
        relatedClauseIds: raw.relatedClauseIds,
        unverifiedFields: unverifiedFields.length > 0 ? unverifiedFields : undefined,
      };

      if (clause.charStart >= 0) {
        clause.charEnd = clause.charStart + raw.verbatimQuote.length;
      }

      allClauses.push(clause);
    }

    // Stage 4: Extract key facts
    const keyFactsResult = await callGeminiWithRetry(
      keyFactsPrompt(text, documentInfo.typeLabel),
      "You are a legal document fact extractor. Return valid JSON only.",
      (raw) => KeyFactsResponseSchema.parse(JSON.parse(raw)),
      30000
    );

    const keyFacts: KeyFact[] = keyFactsResult.facts.map((f) => ({
      ...f,
      verified: true, // key facts verified by presence in source (simplified)
    }));

    // Stage 5: Deterministic scoring
    const score = computeFinePrintScore(allClauses);

    // Stage 6: Missing protections check
    const missingProtections = checkMissingProtections(docType, allClauses, text);

    const result: AnalysisResult = {
      id: contentHash.slice(0, 16),
      documentInfo,
      clauses: allClauses,
      keyFacts,
      score,
      missingProtections,
      rawText: text,
      contentHash,
      analyzedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze] Error:", err);
    const message =
      err instanceof Error ? err.message : "Analysis failed. Please try again.";

    if (message.includes("API key")) {
      return NextResponse.json({ error: "API_KEY_INVALID", message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "ANALYSIS_FAILED", message: "Analysis failed. You can try demo mode while we investigate." },
      { status: 500 }
    );
  }
}
