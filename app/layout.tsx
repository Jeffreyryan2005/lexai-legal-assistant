import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Scale } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexAI — AI Legal Companion",
  description:
    "Understand, compare, and navigate legal documents with AI-powered analysis. LexAI makes legal information accessible to everyone.",
  keywords: [
    "legal AI",
    "contract analysis",
    "legal document",
    "AI legal assistant",
    "legal tech",
    "contract comparison",
  ],
  authors: [{ name: "LexAI" }],
  openGraph: {
    title: "LexAI — AI Legal Companion",
    description: "AI-powered legal document analysis and assistance",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" style={{ colorScheme: "light" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen font-sans`}
        style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>

        {/* Navigation */}
        <header
          role="banner"
          className="sticky top-0 z-40 border-b border-slate-100 shadow-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)" }}
        >
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="LexAI Home"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
                <Scale className="h-4.5 w-4.5 text-white" aria-hidden="true" style={{ height: "18px", width: "18px" }} />
              </div>
              <span className="font-black text-slate-900 text-xl tracking-tight">
                Lex<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>

            {/* Navigation links */}
            <ul className="flex items-center gap-1" role="list">
              {[
                { href: "/analyze", label: "Analyze", emoji: "📄" },
                { href: "/compare", label: "Compare", emoji: "⚖️" },
                { href: "/chat", label: "Chat", emoji: "💬" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Main content with ErrorBoundary and main role */}
        <main id="main-content" role="main" className="mx-auto max-w-6xl px-4 py-10">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer role="contentinfo" className="border-t border-slate-100 bg-white mt-20">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
                  <Scale className="text-white" aria-hidden="true" style={{ height: "14px", width: "14px" }} />
                </div>
                <span className="font-black text-slate-900">
                  Lex<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs max-w-lg leading-relaxed">
                LexAI provides AI-generated analysis for informational purposes only.
                This is not legal advice. Always consult a qualified legal professional
                for advice specific to your situation.
              </p>
              <p className="text-slate-500 text-xs font-medium">
                © {new Date().getFullYear()} LexAI — Built for PromptWars Virtual Hackathon
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
