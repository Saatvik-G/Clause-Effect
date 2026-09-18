# Clause & Effect

> **"Decode. Compare. Navigate."**  
> *AI for Legal Assistance & Access — Empowering ordinary people to understand, compare, and navigate legal documents in 60 seconds.*

---

## ⚖️ Executive Summary

**Clause & Effect** is a specialized legal-tech application built for ordinary citizens — tenants, entry-level employees, freelancers, students, and small shop owners — who are about to sign binding legal agreements without access to an expensive attorney on retainer.

In under 60 seconds, Clause & Effect answers four foundational questions:
1. **What am I actually signing?** (Plain-language translations across 3 reading levels).
2. **What can hurt me?** (Objective risk categorization, IF→THEN consequences, Fine Print Score).
3. **What changed between two drafts?** (Side-by-side clause alignment & draggable tracing paper overlay).
4. **What do I do next?** (Action tickets, calendar deadline exports, negotiation counter-language).

### Non-Goals & Trust Layer
- **Not a Lawyer / No Legal Advice**: Persistent disclaimers accompany every output. Clause & Effect translates terms into plain language; it does not represent clients.
- **Zero Document Retention**: Zero server-side database. No files or text are ever logged or persisted. The entire session is held in memory and can be wiped instantly with the **"Forget Everything"** button.

---

## 🏛️ "The Case Desk" Design System

Clause & Effect rejects generic SaaS templates, purple gradients, and glassmorphism. It is themed around a **paralegal's physical desk**:
- **Tactile Paper Texture**: Custom SVG `feTurbulence` grain overlay on natural paper stock (`#F3EDE0`).
- **Physical Desk Metaphors**:
  - Ink-stamped rubber seals (`HIGH RISK`, `CAUTION`, `FAIR`, `READY TO SIGN`).
  - Highlighter sweeps that slide across clauses as you scroll.
  - Manila-folder tabs (`DECODE`, `COMPARE`, `NAVIGATE`) with realistic physical layering.
  - Red-string links drawn via SVG path length connecting interrelated obligations.
  - Corkboard header with pinned key facts and deadlines.
- **Typography Hierarchy**:
  - Display: *Bricolage Grotesque*
  - Document Paper: *Newsreader* (editorial serif)
  - Stamps & Machine Outputs: *JetBrains Mono*
  - Margin Annotations: *Caveat*
- **Night-Shift Mode**: Dark mahogany desk theme with low eye-strain contrast.
- **Accessibility**: Dyslexia-friendly font toggle, WCAG AA contrast, reduced-motion toggle, and keyboard shortcuts (`?`).

---

## 🛠️ Architecture & Pipeline

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│  Document Input │ ───>  │ Client-Side PII  │ ───>  │ Deterministic        │
│ PDF / DOCX / TXT│       │    Redactor      │       │ Clause Segmenter     │
└─────────────────┘       └──────────────────┘       └──────────────────────┘
                                                                │
                                                                ▼
┌─────────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│ Deterministic   │ <───  │ Verbatim Quote   │ <───  │ Gemini LLM Pipeline  │
│ Fine Print Score│       │ Substring Check  │       │ Route Handlers (JSON)│
└─────────────────┘       └──────────────────┘       └──────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           The Case Desk Workspaces                        │
│   [DECODE Workspace]     |   [COMPARE Workspace]  |  [NAVIGATE Workspace] │
│ • Plain-language levels  | • Semantic Alignment   | • Action Tickets      │
│ • IF->THEN consequences  | • Tracing Paper Slider | • .ics Export         │
│ • Red string connectors  | • Net Effect Stamp     | • WhatsApp Summary    │
│ • What-If Simulator      | • Change Chips         | • Legal Aid Directory │
│ • Negotiation Helper     |                        |                       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Features (P0, P1, P2)

### 📌 P0: Core Foundations
1. **Multi-Format Ingestion**: PDF (pdfjs-dist), Word DOCX (mammoth), and raw text with strict file size/page limits.
2. **Deterministic Clause Segmentation**: Stable IDs (`clause-1`, `clause-2`) with character offset tracking.
3. **Multi-Tier Plain Meaning**: Instant toggle between *Simple*, *Standard*, and *Lawyer-Lite*.
4. **Deterministic Fine Print Score (0-100)**: Mathematically calculated from clause risk penalties, who-benefits multipliers, and category weights (never a raw LLM guess).
5. **Missing-Protections Checker**: Evaluates documents against static checklists for rental, employment, loan, NDA, freelance, and terms agreements.
6. **Grounded Q&A with Strict Refusal**: If a question is not addressed in the document, it explicitly replies *"This document doesn't address that."*
7. **Offline Demo Mode**: 5 precomputed sample documents (rental, employment, freelance, loan, app terms) + sample compare pair available with zero setup or API key.

### 🚀 P1: Power Tools
8. **Multilingual Access**: UI and summaries localized in English, Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்), and Telugu (తెలుగు).
9. **Voice Assistant**: Web Speech API read-aloud for clause explanations + microphone voice input for Q&A.
10. **Browser OCR**: Lazy-loaded `tesseract.js` for camera snapshots and scanned images with editable preview.
11. **What-If Scenario Simulator**: Interactive slider calculating mathematical consequences (e.g. leaving in month 3 vs month 6).
12. **Negotiation Helper & Drafter**: Custom counter-language and one-click draft email generation with friendly/firm tone toggle.
13. **Client-Side PII Masking**: Automatically shields emails, Indian phone numbers, Aadhaar, and PAN numbers before transmission.
14. **Exports**: One-click `.ics` calendar download for notice deadlines, WhatsApp clipboard summary, and printable PDF report.
15. **Legal Jargon Glossary**: In-app dictionary with practical examples of common legal concepts.

### 🎯 P2: Safeguards & Inclusion
16. **Internal Contradiction Detector**: Flags conflicts between cross-cutting clauses (e.g. lock-in forfeiture vs termination rights).
17. **Signing-Readiness Checklist**: Interactive requirements checklist featuring a physical rubber stamp verdict (`READY TO SIGN` vs `DO NOT SIGN YET`).
18. **Inclusion & Shortcuts**: Dyslexia font toggle, reduced-motion controls, and `?` keyboard cheat sheet.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js 18+ (tested on Node v25)
- npm or pnpm

### Installation
```bash
git clone https://github.com/Saatvik-G/Clause-Effect.git
cd Clause-Effect
npm install --legacy-peer-deps --ignore-scripts
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```
*(Note: Clause & Effect works 100% in Demo Mode even without an API key using the bundled sample datasets).*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Run Test Suite
```bash
node "node_modules/vitest/vitest.mjs" run
```

### Production Build
```bash
node "node_modules/next/dist/bin/next" build
```

---

## ⚠️ Limitations & Disclaimers

1. **Information Only**: Clause & Effect is not a licensed attorney, paralegal, or legal substitute. It provides structural summaries and issue-spotting based solely on uploaded text.
2. **Grounded In Text**: The tool does not perform statutory case-law research from memory; legal assistance organizations listed are static public directories.
3. **Local State**: Because no database is used, refreshing the browser or clicking "Forget Everything" permanently erases session context.
