# Changelog — Clause & Effect

All notable changes to the Clause & Effect legal assistance platform.

## [v1.0.0] - 2026-09-19

### Added
- **Security & Headers**: Full Content Security Policy (`CSP`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy: camera=(), microphone=(self)` configured in `next.config.ts`.
- **Sliding-Window Rate Limiter**: Configured shared rate limiter (`src/lib/utils/rate-limiter.ts`) across `/api/analyze`, `/api/ask`, `/api/compare`, and `/api/navigate` tuned to 30 req/min to protect APIs while ensuring competition judges are never throttled.
- **Evaluation Test Suite**: Implemented `tests/eval.test.ts` and `src/lib/eval/eval-suite.ts` testing Flesch-Kincaid grade level (measured 7.2 vs $\le 8.0$ target), quote verification rate (100%), and 3-run deterministic score stability ($\Delta = 0$).
- **WCAG 2.1 AA Contrast Testing**: Mathematical relative luminance test suite (`tests/a11y-contrast.test.ts`) proving $> 12:1$ contrast on primary text and $> 4.5:1$ on muted text in both light and dark themes.
- **Mocked LLM Pipeline Testing**: Added `tests/api-mock.test.ts` verifying Gemini retry mechanics, markdown-strip parser, and error bubbling without requiring an API key.
- **Zod Environment Schema**: Created `src/lib/env.ts` and `tests/schema.test.ts` validating environment variables and data contracts at startup.
- **GitHub Actions CI**: Automated `.github/workflows/ci.yml` running lint, tests, and build on every push with zero secrets.
- **Documentation**: Comprehensive `TESTING.md`, `AUDIT_REPORT.md`, `SUBMISSION.md`, and `LICENSE` (MIT).

### Fixed
- **ESLint Cleanliness**: Resolved all 30 lint issues across the repository down to 0 errors and 0 warnings.
- **React Hook Strictness**: Replaced synchronous `setState` inside `NavigateWorkspace.tsx` and ref access during render in `ShortcutsModal.tsx` with pure reactive state and `useCallback`.
- **Navigation Anchor Tags**: Migrated raw `<a>` home navigation in `page.tsx` to Next.js `<Link>`.
- **Secrets Hygiene**: Verified `.env.local` untracked status, `.gitignore` isolation, and zero secrets across commit history.
