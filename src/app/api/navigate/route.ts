import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithRetry, hasApiKey } from "@/lib/ai/client";
import { navigatePrompt } from "@/lib/ai/prompts";
import { NavigateResponseSchema } from "@/lib/ai/schemas";
import type { Clause, NavigateResult, ActionTicket } from "@/lib/types";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "NO_API_KEY", message: "API key not configured." },
      { status: 503 }
    );
  }

  let body: { text?: string; docType?: string; clauses?: Clause[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text = "", docType = "other", clauses = [] } = body;

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const navResult = await callGeminiWithRetry(
      navigatePrompt(
        text,
        docType,
        clauses.map((c) => ({
          id: c.id,
          title: c.title,
          risk: c.risk,
          verbatimQuote: c.verbatimQuote,
        }))
      ),
      "You are a legal document navigation assistant. Return valid JSON only.",
      (raw) => NavigateResponseSchema.parse(JSON.parse(raw)),
      45000
    );

    const tickets: ActionTicket[] = navResult.actionTickets.map((t) => ({
      ...t,
      by: t.by ?? null,
      carry: t.carry ?? [],
    }));

    const result: NavigateResult = {
      redFlags: navResult.redFlags,
      actionTickets: tickets,
      questionsBeforeSigning: navResult.questionsBeforeSigning,
      questionsForLawyer: navResult.questionsForLawyer,
      deadlines: navResult.deadlines,
      analyzedAt: Date.now(),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[navigate] Error:", err);
    return NextResponse.json(
      { error: "NAVIGATE_FAILED", message: "Navigation guide failed. Please try again." },
      { status: 500 }
    );
  }
}
