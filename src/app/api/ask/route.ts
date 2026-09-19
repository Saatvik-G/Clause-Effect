import { NextRequest } from "next/server";
import { getGeminiClient, getModelName, hasApiKey } from "@/lib/ai/client";
import { askPrompt } from "@/lib/ai/prompts";
import { AskResponseSchema } from "@/lib/ai/schemas";

export async function POST(req: NextRequest): Promise<Response> {
  if (!hasApiKey()) {
    return new Response(
      JSON.stringify({ error: "NO_API_KEY", answer: "Demo mode: API key not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: {
    question?: string;
    text?: string;
    clauses?: Array<{ id: string; title: string; verbatimQuote: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { question, text, clauses = [] } = body;

  if (!question || !text) {
    return new Response(JSON.stringify({ error: "Missing question or text" }), { status: 400 });
  }

  if (question.length > 500) {
    return new Response(JSON.stringify({ error: "Question too long (max 500 chars)" }), { status: 422 });
  }

  // Stream the response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const client = getGeminiClient();
        const modelName = getModelName();
        const prompt = askPrompt(question, text, clauses);

        // Use streaming for Q&A
        const result = await client.models.generateContentStream({
          model: modelName,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            temperature: 0.15,
            responseMimeType: "application/json",
          },
        });

        let fullText = "";
        for await (const chunk of result) {
          const chunkText = chunk.text ?? "";
          fullText += chunkText;
          // Stream token by token for typewriter effect
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunkText })}\n\n`));
        }

        // Validate the full response
        try {
          const cleaned = fullText
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
          const parsed = AskResponseSchema.parse(JSON.parse(cleaned));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, result: parsed })}\n\n`)
          );
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                result: {
                  answer: "I had trouble parsing the response. Please try again.",
                  clauseIds: [],
                  confidence: 0,
                  notAddressed: false,
                },
              })}\n\n`
            )
          );
        }
      } catch (err) {
        console.error("[ask] Stream error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "Failed to process question. Please try again.",
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
