# Security Policy

## Supported Versions

LexAI is actively maintained. Security fixes are applied to the latest version only.

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |
| < 1.0   | ❌        |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public GitHub issue.

Instead, report it by emailing the maintainer directly. Include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Any suggested fixes (optional)

You will receive an acknowledgment within 48 hours and a full response within 7 days.

## Security Architecture

### API Key Management
- The Gemini API key is stored exclusively as a server-side environment variable (`GEMINI_API_KEY`)
- It is **never** exposed to the client-side JavaScript bundle
- It is **never** committed to version control (enforced via `.gitignore`)

### Input Validation & Sanitization
- All file uploads are validated for MIME type, file extension, and size (≤ 5MB)
- Text content is sanitized to remove control characters before AI processing
- All API request bodies are validated using **Zod schemas** before processing
- File content is isolated from system prompts using clear delimiters

### Prompt Injection Defense
- All system prompts begin with an explicit instruction to ignore embedded instructions
- Document content is passed as a separate, clearly-delimited section
- Gemini safety settings are configured to block harmful content generation

### Rate Limiting
- Sliding window rate limiter: 20 requests per minute per IP address
- IP extraction handles `X-Forwarded-For` chains (Vercel proxy-aware)
- Rate limit headers returned for transparency

### HTTP Security Headers
Applied via both `middleware.ts` (Edge) and `next.config.js`:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | Strict CSP restricting script/style/connect sources |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Restricts camera, microphone, geolocation, payment |

### Data Privacy
- **No document storage**: Uploaded files are processed in memory and never persisted to disk or database
- **No user tracking**: No analytics, cookies, or user accounts
- **Stateless**: Every request is independent; no session data retained

### Dependency Security
- Dependencies are pinned to specific versions in `package-lock.json`
- Run `npm audit` regularly to check for known vulnerabilities
