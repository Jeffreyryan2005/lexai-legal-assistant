# Changelog

All notable changes to LexAI are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.2.0] — 2026-09-14

### Added — Security
- `proxy.ts`: Next.js Edge Proxy with suspicious URL pattern detection, API key presence validation, and 6 security response headers
- `lib/validators.ts`: `validateMagicBytes()` — validates file content via magic byte inspection (PDF `%PDF`, DOCX `PK` ZIP header) to prevent MIME spoofing attacks
- `lib/validators.ts`: `sanitizeFileName()` — strips path traversal sequences (`../../`), null bytes, and shell-dangerous characters from uploaded filenames
- `SECURITY.md`: Full security policy with vulnerability reporting and threat model documentation
- `@types/pdf-parse`: Added type definitions (0 known vulnerabilities, `npm audit` clean)

### Added — Code Quality
- `lib/constants.ts`: Centralized all magic numbers — file limits, rate limits, Gemini config, chat config, file types, legal disclaimer
- `lib/logger.ts`: Structured JSON logger with sensitive field redaction (`apiKey`, `password`, `token`, `secret`, `authorization`), dev-only debug mode
- `lib/index.ts`: Barrel export for all library modules
- `types/index.ts`: Centralized shared TypeScript types for all API responses and component props
- `components/ErrorBoundary.tsx`: React Error Boundary for graceful runtime error handling

### Added — Testing
- `__tests__/unit/security.test.ts`: 21 tests for `validateMagicBytes` and `sanitizeFileName`
- `__tests__/unit/logger.test.ts`: 16 tests for structured logger (levels, redaction, format)
- `__tests__/unit/constants.test.ts`: 20 tests for all constant values
- `__tests__/integration/analyze.test.ts`: 6 integration tests for `/api/analyze` with fully mocked Gemini
- Coverage threshold raised from 50% → 70%

### Added — UX & Efficiency
- `app/loading.tsx`: Root loading skeleton with animated placeholders
- `app/analyze/loading.tsx`: Analyze page loading skeleton
- `app/not-found.tsx`: Custom 404 page with recovery navigation
- `React.memo`: Applied to `AnalysisPanel`, `CompareView`, `ClauseCard`, `RiskMeter`, `Disclaimer` — prevents unnecessary re-renders

### Changed — Theme
- `app/globals.css`: Forced light mode — removed `@media (prefers-color-scheme: dark)` override
- `app/layout.tsx`: Glass-effect nav, gradient logo, emoji navigation labels
- `app/page.tsx`: Gradient hero, polished feature cards, highlights grid, bottom CTA

### Changed — API Routes
- All routes: Replaced `console.error` with structured `logger.error` (no stack trace leakage)
- `/api/analyze`: Added magic bytes validation + filename sanitization before text extraction

---

## [1.1.0] — 2026-09-14

### Added
- `app/api/analyze/route.ts`: Document analysis endpoint with rate limiting, Zod validation, streaming Gemini
- `app/api/compare/route.ts`: Document comparison endpoint with parallel processing via `Promise.all`
- `app/api/chat/route.ts`: Streaming Q&A chat via Server-Sent Events (SSE)
- `lib/gemini.ts`: Gemini 2.0 Flash client with retry/backoff, safety settings, token management
- `lib/prompts.ts`: Prompt engineering with injection defense and legal disclaimers
- `lib/rateLimit.ts`: Sliding window rate limiter (20 req/min/IP)
- `lib/riskScorer.ts`: Risk score utilities (1–10 → Low/Medium/High/Critical)
- `next.config.js`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options security headers
- `vercel.json`: Deployment config targeting `bom1` region

### Added — Components
- `DocumentUploader`: Drag-and-drop, keyboard accessible, ARIA labeled
- `AnalysisPanel`: Full results with risk meter, clauses, obligations, action items
- `RiskMeter`: Animated gauge with ARIA meter role (WCAG AA)
- `ClauseCard`: Expandable clause card with risk badge
- `CompareView`: Side-by-side comparison with negotiation points
- `ChatInterface`: Streaming SSE chat with markdown rendering
- `Disclaimer`: Legal disclaimer banner (role="note")

---

## [1.0.0] — 2026-09-14

### Added
- Initial Next.js 14 App Router scaffold
- TypeScript strict mode configuration
- ESLint + Prettier setup
- 78 passing unit tests (validators, riskScorer, prompts, rateLimit)
