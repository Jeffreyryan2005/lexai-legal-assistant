# LexAI — AI for Legal Assistance & Access

> **PromptWars Virtual (Exclusive Edition) — AI for Legal Assistance & Access Challenge**

LexAI is a production-grade, GenAI-powered legal companion that makes legal information accessible to everyone. It helps non-lawyers understand complex legal documents, compare contracts, identify risks, and prepare informed conversations with legal professionals.

---

## 🎯 Chosen Vertical

**AI for Legal Assistance & Access** — empowering individuals to understand and navigate legal documents without requiring legal expertise, while always directing them toward professional help for advice specific to their situation.

---

## 🚀 Live Demo

> Deployed on Vercel: [https://lexai-legal-assistant.vercel.app](https://lexai-legal-assistant.vercel.app) *(update with your URL after deployment)*

---

## ✨ Features

### 1. 📄 Document Analysis (`/analyze`)
Upload any legal document (PDF, DOCX, TXT up to 5MB) and receive:
- **Plain-English Summary** — 3-5 sentence overview for non-lawyers
- **Risk Score** — Visual 1–10 gauge with color-coded risk level (Low / Medium / High / Critical)
- **Clause-by-Clause Breakdown** — Every important clause explained in simple terms with individual risk ratings
- **Obligation Mapping** — What each party must do under the agreement
- **Red Flags** — Unusual, one-sided, or concerning terms highlighted
- **Missing Clauses** — Important protections absent from the document
- **Action Checklist** — Prioritized next steps (before signing, within X days, etc.)
- **Lawyer Questions** — 5-7 specific questions to ask a legal professional

### 2. ⚖️ Contract Comparison (`/compare`)
Upload two legal documents and get:
- **Side-by-Side Difference View** — Each clause compared across both documents
- **Significance Ratings** — Low / Medium / High for each difference
- **Favorability Assessment** — Which document benefits the signing party more
- **Risk Comparison** — Individual risk scores for both documents
- **Unique Clause Detection** — Clauses present in only one document
- **Negotiation Points** — Specific leverage points for negotiation
- **Recommendation** — Which version to prefer and how to proceed

### 3. 💬 Legal Q&A Chat (`/chat`)
Ask natural language questions about your legal document:
- **Document-Grounded Answers** — Responses based directly on your uploaded document
- **Streaming Responses** — Real-time AI streaming via Server-Sent Events
- **Multi-Turn Conversation** — Follow-up questions with maintained context
- **Markdown Rendering** — Structured, formatted answers
- **General Legal Questions** — Works without a document for general legal info

---

## 🏗️ Architecture & Approach

### Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR + streaming API routes in one codebase |
| **Language** | TypeScript (strict mode) | Type safety, maintainability |
| **AI** | Google Gemini 2.0 Flash | Fast, large context window (1M tokens), free tier |
| **Styling** | Tailwind CSS | Utility-first, accessible by default |
| **Icons** | Lucide React | Accessible, tree-shakable |
| **Markdown** | React Markdown + remark-gfm | Chat response rendering |
| **Validation** | Zod | Runtime schema validation |
| **Testing** | Jest + ts-jest | Unit test coverage |

### System Design

```
┌─────────────────────────────────────────────┐
│              Client (Browser)                │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ /analyze │ │ /compare │ │    /chat    │ │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘ │
└───────┼─────────────┼──────────────┼─────────┘
        │             │              │ (SSE Stream)
┌───────▼─────────────▼──────────────▼─────────┐
│              Next.js API Routes               │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │/api/anal │ │/api/comp │ │  /api/chat  │  │
│  │  yze     │ │  are     │ │  (stream)   │  │
│  └────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│       ├── Rate Limiter              │          │
│       ├── Input Validation          │          │
│       └── File Type/Size Check      │          │
└───────┬────────────────────────────┬──────────┘
        │                            │
┌───────▼────────────────────────────▼──────────┐
│                  Core Libraries                │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐   │
│  │extractTe │ │ prompts  │ │  gemini.ts  │   │
│  │xt.ts     │ │  .ts     │ │  (client)   │   │
│  └──────────┘ └──────────┘ └──────┬──────┘   │
└──────────────────────────────────┬─────────────┘
                                   │ HTTPS
┌──────────────────────────────────▼─────────────┐
│           Google Gemini 2.0 Flash API           │
└─────────────────────────────────────────────────┘
```

### Prompt Engineering Strategy

All prompts in `lib/prompts.ts` are engineered for:
1. **Structured JSON output** — reliable parsing of complex analysis
2. **Prompt injection defense** — explicit guard against document-embedded instructions
3. **Legal precision** — focuses on specific clause types known to be high-risk
4. **Consistent disclaimers** — legal advice distinction maintained throughout
5. **Non-lawyer accessibility** — plain English explanations mandatory

### Security Architecture

| Threat | Mitigation |
|---|---|
| API key exposure | Server-side only (`process.env.GEMINI_API_KEY`) — never in client bundle |
| Prompt injection | Explicit injection defense in all system prompts + document context isolation |
| File upload attacks | MIME type validation + magic bytes check + file extension validation + 5MB limit |
| API abuse | Sliding window rate limiter: 20 req/min per IP |
| XSS | React's auto-escaping + Content Security Policy headers |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Data in transit | HTTPS enforced + HSTS headers |
| Large inputs | Token limit enforcement with graceful truncation notice |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Test coverage includes:
- **`validators.test.ts`** — File validation, input sanitization, JSON parsing, Zod schema validation
- **`riskScorer.test.ts`** — Score mapping, color assignment, risk aggregation
- **`prompts.test.ts`** — Prompt structure, injection defense presence, disclaimer inclusion
- **`rateLimit.test.ts`** — Rate limiting logic, IP extraction, blocking behavior

---

## ♿ Accessibility

LexAI is built with accessibility as a first-class concern:
- **Skip navigation link** — Keyboard users can jump to main content
- **ARIA labels** — All icons, interactive elements, and regions labeled
- **ARIA roles** — `meter` for risk scores, `log` for chat, `alert` for errors, `article` for messages
- **Keyboard navigation** — All interactive elements accessible without a mouse
- **Focus management** — After async operations, focus returns to input
- **Screen reader support** — `sr-only` labels for visual-only elements
- **Color contrast** — WCAG AA compliant color combinations throughout
- **Live regions** — Chat messages and errors announced via `aria-live`
- **Semantic HTML** — Proper heading hierarchy, landmark elements, lists

---

## ⚡ Performance

- **Streaming AI responses** — Users see content immediately via SSE, not after full generation
- **Server-side rendering** — Landing page and layouts are server-rendered
- **Lazy loading** — Heavy components loaded only when needed
- **Response caching** — Repeated identical requests benefit from HTTP caching
- **Token management** — Documents truncated at 900k tokens with user notification
- **Parallel processing** — Document comparison processes both files concurrently
- **Exponential backoff** — Automatic retry on Gemini API rate limits/errors

---

## 📁 Project Structure

```
lexai-legal-assistant/
├── app/
│   ├── layout.tsx              # Root layout with nav, header, footer
│   ├── page.tsx                # Landing page (server component)
│   ├── analyze/page.tsx        # Document analysis page
│   ├── compare/page.tsx        # Contract comparison page
│   ├── chat/page.tsx           # Legal Q&A chat page
│   └── api/
│       ├── analyze/route.ts    # POST: analyze single document
│       ├── compare/route.ts    # POST: compare two documents
│       └── chat/route.ts       # POST: streaming chat (SSE)
├── components/
│   ├── DocumentUploader.tsx    # Drag-and-drop file upload
│   ├── AnalysisPanel.tsx       # Full analysis results display
│   ├── RiskMeter.tsx           # Visual risk gauge
│   ├── ClauseCard.tsx          # Expandable clause detail card
│   ├── CompareView.tsx         # Side-by-side comparison view
│   ├── ChatInterface.tsx       # Streaming chat UI
│   └── Disclaimer.tsx          # Legal disclaimer banner
├── lib/
│   ├── gemini.ts               # Gemini AI client (streaming + retry)
│   ├── prompts.ts              # System prompt engineering
│   ├── extractText.ts          # PDF/DOCX/TXT text extraction
│   ├── validators.ts           # Input validation + Zod schemas
│   ├── rateLimit.ts            # Sliding window rate limiter
│   ├── riskScorer.ts           # Risk score utilities
│   └── utils.ts                # Tailwind class utilities
├── __tests__/
│   └── unit/
│       ├── validators.test.ts
│       ├── riskScorer.test.ts
│       ├── prompts.test.ts
│       └── rateLimit.test.ts
├── next.config.js              # Security headers + CSP
├── vercel.json                 # Deployment config
└── .env.example                # Environment variable template
```

---

## 🔧 Setup & Running Locally

### Prerequisites
- Node.js 18+
- A Google Gemini API key ([get one free](https://aistudio.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Jeffreyryan2005/lexai-legal-assistant.git
cd lexai-legal-assistant

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key |

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm test             # Run unit tests
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint code
```

### Deploying to Vercel

1. Push to GitHub (already done)
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy — done in ~60 seconds

---

## 💡 Design Decisions & Assumptions

### Model Choice: Gemini 2.0 Flash
- **Why:** 1M token context window handles even large contracts without chunking
- **Why:** Free tier with sufficient rate limits for a hackathon demo
- **Why:** Significantly faster than larger models for streaming responses

### JSON-Structured Prompts
All AI responses are requested as structured JSON rather than free-form text. This enables:
- Reliable programmatic parsing
- Consistent UI rendering
- Easy validation of response completeness
- Graceful fallback when parsing fails

### No Database Required
Analysis is stateless — documents are processed per-request and not stored. This:
- Eliminates privacy concerns about document storage
- Simplifies architecture significantly
- Reduces infrastructure costs

### Rate Limiting
20 requests/minute per IP with sliding window algorithm. This:
- Prevents API key exhaustion
- Protects against automated abuse
- Provides fair usage for legitimate users

### Assumptions
1. Users upload documents they have legal right to share with an AI service
2. The application provides information only — not legal advice (enforced by prominent disclaimers)
3. Documents are in English (primary language of Gemini's legal training data)
4. File size limit of 5MB covers the vast majority of legal documents
5. Gemini API key is provided via environment variable (never hardcoded)

---

## ⚖️ Ethical Considerations

1. **Not a replacement for legal counsel** — Every page prominently displays the disclaimer that LexAI provides informational analysis only
2. **Privacy-first** — Documents are never stored; analysis is per-request and ephemeral
3. **Transparency** — Users can see exactly what the AI analyzed through the UI
4. **Accessibility** — Built for users of all abilities, including screen reader users
5. **Responsible AI** — Safety settings configured to block harmful content generation

---

## 📊 Evaluation Criteria Alignment

| Criterion | Implementation |
|---|---|
| **Code Quality** | TypeScript strict mode, ESLint, clean architecture, JSDoc comments, no dead code |
| **Security** | CSP headers, API-key server-only, input sanitization, rate limiting, file validation, prompt injection defense |
| **Efficiency** | Streaming responses, parallel processing, token management, exponential backoff, lazy loading |
| **Testing** | Jest unit tests for validators, risk scorer, prompts, and rate limiter with coverage thresholds |
| **Accessibility** | WCAG AA, ARIA roles/labels, keyboard navigation, skip links, live regions, semantic HTML |
| **Problem Alignment** | Covers all 7 use cases: simplify, compare, highlight clauses, Q&A, next steps, summaries, checklists + lawyer questions |

---

*Built with ❤️ for the PromptWars Virtual (Exclusive Edition) Hackathon — AI for Legal Assistance & Access*
