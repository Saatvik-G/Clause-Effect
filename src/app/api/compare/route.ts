import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithRetry, hasApiKey } from "@/lib/ai/client";
import { comparePrompt } from "@/lib/ai/prompts";
import { CompareResponseSchema } from "@/lib/ai/schemas";
import type { Clause, CompareResult, ClauseDiff, ChangeType } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "NO_API_KEY", message: "API key not configured." },
      { status: 503 }
    );
  }

  let body: {
    textV1?: string;
    textV2?: string;
    clausesV1?: Clause[];
    clausesV2?: Clause[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { textV1 = "", textV2 = "", clausesV1 = [], clausesV2 = [] } = body;

  if (!textV1 || !textV2) {
    return NextResponse.json({ error: "Missing textV1 or textV2" }, { status: 400 });
  }

  try {
    const compareResult = await callGeminiWithRetry(
      comparePrompt(
        textV1,
        clausesV1.map((c) => ({ id: c.id, title: c.title, verbatimQuote: c.verbatimQuote })),
        textV2,
        clausesV2.map((c) => ({ id: c.id, title: c.title, verbatimQuote: c.verbatimQuote }))
      ),
      "You are a legal document change analyser. Return valid JSON only.",
      (raw) => CompareResponseSchema.parse(JSON.parse(raw)),
      60000
    );

    const diffs: ClauseDiff[] = compareResult.diffs.map((d) => ({
      id: d.id,
      changeType: d.changeType as ChangeType,
      clauseV1: clausesV1.find((c) => c.id === d.clauseV1Id),
      clauseV2: clausesV2.find((c) => c.id === d.clauseV2Id),
      explanation: d.explanation,
      significance: d.significance,
    }));

    const result: CompareResult = {
      diffs,
      verdict: compareResult.verdict,
      analyzedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[compare] Error:", err);
    return NextResponse.json(
      { error: "COMPARE_FAILED", message: "Comparison failed. Please try again." },
      { status: 500 }
    );
  }
}
