# Testing Guide — Clause & Effect

Clause & Effect has a comprehensive automated testing suite across unit, evaluation, rate-limiting, and accessibility criteria. All tests pass from a fresh clone with **zero secrets and no API key required**.

---

## 🚀 Running the Tests

### 1. Run Complete Test Suite
```bash
npm test
```
Executes all 10 test suites covering 60 automated tests in Vitest.

### 2. Run Evaluation Suite (Challenge Criteria 3.1)
```bash
npm run eval
```
Runs the automated readability, quote accuracy, stability, and prompt-injection resistance evaluations.

### 3. Run Test Coverage
```bash
npm run test:coverage
```

### 4. Run Lint & Static Type Analysis
```bash
npm run lint
```
Enforces TypeScript strict typing and Next.js / ESLint rules with 0 errors and 0 warnings.

---

## 🧪 Test Suite Structure

| File | Criterion | Target / Purpose |
| :--- | :--- | :--- |
| [`tests/segmenter.test.ts`](file:///d:/Projects/Clause&Effect/tests/segmenter.test.ts) | P0 Pipeline | Deterministic clause segmentation, stable ID generation (`clause-1`), character offset tracking. |
| [`tests/verifier.test.ts`](file:///d:/Projects/Clause&Effect/tests/verifier.test.ts) | P0 Pipeline / Trust | Verbatim quote substring verification, punctuation & whitespace normalisation, hallucination flags. |
| [`tests/scorer.test.ts`](file:///d:/Projects/Clause&Effect/tests/scorer.test.ts) | P0 Pipeline | Deterministic Fine Print Score formula (0–100), risk penalties, who-benefits multipliers. |
| [`tests/eval.test.ts`](file:///d:/Projects/Clause&Effect/tests/eval.test.ts) | 3.1 Problem Alignment | Flesch-Kincaid grade level ($\le 8.0$), quote verification rate ($\ge 98\%$), 3-run deterministic score stability ($\Delta = 0$), unanswerable question refusals. |
| [`tests/rate-limiter.test.ts`](file:///d:/Projects/Clause&Effect/tests/rate-limiter.test.ts) | 3.3 Security | Per-IP token-bucket rate limiter, burst tolerance for judges (30 req/min), abuse prevention. |
| [`tests/schema.test.ts`](file:///d:/Projects/Clause&Effect/tests/schema.test.ts) | 3.2 Code Quality | Zod schema validation for environment variables, clause analysis, ask responses, compare diffs, and navigation roadmaps. |
| [`tests/api-mock.test.ts`](file:///d:/Projects/Clause&Effect/tests/api-mock.test.ts) | 3.5 Testing | Mocked LLM client, markdown-wrapped JSON stripping, schema retry logic, timeout handling without network or keys. |
| [`tests/redactor.test.ts`](file:///d:/Projects/Clause&Effect/tests/redactor.test.ts) | 3.3 Privacy & Security | Client-side PII masking for emails, phone numbers, Aadhaar, PAN numbers. |
| [`tests/ics.test.ts`](file:///d:/Projects/Clause&Effect/tests/ics.test.ts) | P1 Navigation | iCalendar (`.ics`) RFC 5545 format export and timezone formatting for action deadlines. |
| [`tests/a11y-contrast.test.ts`](file:///d:/Projects/Clause&Effect/tests/a11y-contrast.test.ts) | 3.6 Accessibility | Mathematical WCAG 2.1 relative luminance and contrast ratio validation for light ("The Case Desk") and dark themes ($> 12:1$ primary, $> 4.5:1$ muted). |

---

## 🛡️ Adversarial Break Testing

To verify end-to-end resilience against empty files, corrupt payloads, huge files, and hallucinations against both local server and production:
```bash
npx tsx tests/adversarial-break.ts
```
