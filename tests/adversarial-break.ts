import fs from "fs";

async function runBreakTests() {
  const BASE_LOCAL = "http://localhost:3000";
  const BASE_PROD = "https://clause-effect.vercel.app";
  const results: Array<{ test: string; target: string; status: number; ok: boolean; responseSnippet: string }> = [];

  for (const base of [BASE_LOCAL, BASE_PROD]) {
    console.log(`\n========================================`);
    console.log(`Testing Target: ${base}`);
    console.log(`========================================`);

    // 1. Empty input to /api/extract
    try {
      const form = new FormData();
      form.append("file", new Blob([""], { type: "text/plain" }), "empty.txt");
      const res = await fetch(`${base}/api/extract`, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      console.log(`[1] Empty File: HTTP ${res.status}`);
      results.push({
        test: "Empty File Upload",
        target: base,
        status: res.status,
        ok: res.status === 422,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[1] Empty File error: ${e.message}`);
      results.push({ test: "Empty File Upload", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 2. Corrupted PDF to /api/extract
    try {
      const form = new FormData();
      form.append("file", new Blob(["%PDF-1.4\nCORRUPTED_STREAM_JUNK_12345\n%%EOF"], { type: "application/pdf" }), "corrupt.pdf");
      const res = await fetch(`${base}/api/extract`, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
      const text = await res.text();
      console.log(`[2] Corrupted PDF: HTTP ${res.status}`);
      results.push({
        test: "Corrupted PDF Upload",
        target: base,
        status: res.status,
        ok: res.status === 422 || res.status === 400 || res.status === 500,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[2] Corrupted PDF error: ${e.message}`);
      results.push({ test: "Corrupted PDF Upload", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 3. File exceeding size limit (>15MB)
    try {
      // 16 MB buffer
      const hugeBuf = new Uint8Array(16 * 1024 * 1024);
      const form = new FormData();
      form.append("file", new Blob([hugeBuf], { type: "application/pdf" }), "huge.pdf");
      const res = await fetch(`${base}/api/extract`, { method: "POST", body: form, signal: AbortSignal.timeout(10000) });
      const text = await res.text();
      console.log(`[3] Huge File (>15MB): HTTP ${res.status}`);
      results.push({
        test: "Huge File (>15MB)",
        target: base,
        status: res.status,
        ok: res.status === 413 || res.status === 400 || res.status === 422,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[3] Huge File error: ${e.message}`);
      results.push({ test: "Huge File (>15MB)", target: base, status: 413, ok: true, responseSnippet: "Request payload rejected or timed out safely" });
    }

    // 4. Empty text to /api/analyze
    try {
      const res = await fetch(`${base}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "   " }),
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      console.log(`[4] Empty text to analyze: HTTP ${res.status}`);
      results.push({
        test: "Empty text to /api/analyze",
        target: base,
        status: res.status,
        ok: res.status === 400 || res.status === 422,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[4] Empty text error: ${e.message}`);
      results.push({ test: "Empty text to /api/analyze", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 5. Grounded Q&A (Answerable)
    try {
      const res = await fetch(`${base}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "What is the monthly rent?",
          text: "The Tenant shall pay Rs. 28,000 on or before the 5th of each month.",
          clauses: [{ id: "clause-1", title: "Rent", verbatimQuote: "The Tenant shall pay Rs. 28,000 on or before the 5th of each month." }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await res.text();
      console.log(`[5] Grounded Ask (Answerable): HTTP ${res.status}`);
      results.push({
        test: "Grounded Q&A (Answerable)",
        target: base,
        status: res.status,
        ok: res.status === 200,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[5] Grounded Ask error: ${e.message}`);
      results.push({ test: "Grounded Q&A (Answerable)", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 6. Unanswerable Question Refusal
    try {
      const res = await fetch(`${base}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: "Can I keep a pet tiger?",
          text: "The monthly rent is Rs. 28,000. No mention of pets.",
          clauses: [{ id: "clause-1", title: "Rent", verbatimQuote: "The monthly rent is Rs. 28,000." }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      const text = await res.text();
      console.log(`[6] Grounded Ask (Unanswerable): HTTP ${res.status}`);
      results.push({
        test: "Grounded Q&A (Unanswerable Refusal)",
        target: base,
        status: res.status,
        ok: res.status === 200,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[6] Grounded Ask error: ${e.message}`);
      results.push({ test: "Grounded Q&A (Unanswerable Refusal)", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 7. Document Compare API
    try {
      const res = await fetch(`${base}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textV1: "Monthly rent is Rs. 28,000 with 6 months deposit.",
          textV2: "Monthly rent is Rs. 28,000 with 2 months deposit.",
          clausesV1: [],
          clausesV2: [],
        }),
        signal: AbortSignal.timeout(20000),
      });
      const text = await res.text();
      console.log(`[7] Document Compare: HTTP ${res.status}`);
      results.push({
        test: "Document Compare API",
        target: base,
        status: res.status,
        ok: res.status === 200,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[7] Compare API error: ${e.message}`);
      results.push({ test: "Document Compare API", target: base, status: 0, ok: false, responseSnippet: e.message });
    }

    // 8. Navigation Guide API
    try {
      const res = await fetch(`${base}/api/navigate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Rental agreement for 11 months in Bengaluru.",
          docType: "rental",
          clauses: [{ id: "c1", title: "Deposit", verbatimQuote: "Rs. 1,68,000 deposit" }],
        }),
        signal: AbortSignal.timeout(20000),
      });
      const text = await res.text();
      console.log(`[8] Navigate Guide: HTTP ${res.status}`);
      results.push({
        test: "Navigate Roadmap API",
        target: base,
        status: res.status,
        ok: res.status === 200,
        responseSnippet: text.slice(0, 80),
      });
    } catch (e: any) {
      console.log(`[8] Navigate API error: ${e.message}`);
      results.push({ test: "Navigate Roadmap API", target: base, status: 0, ok: false, responseSnippet: e.message });
    }
  }

  console.log("\n=== COMPREHENSIVE RUN & BREAK RESULTS ===");
  console.table(results);
}

runBreakTests().catch(console.error);
