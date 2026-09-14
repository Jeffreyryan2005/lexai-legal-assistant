import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Scale } from "lucide-react";

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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 font-sans`}
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>

        {/* Navigation */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="LexAI Home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <Scale className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-slate-900 text-lg">
                Lex<span className="text-indigo-600">AI</span>
              </span>
            </Link>

            {/* Navigation links */}
            <ul className="flex items-center gap-1" role="list">
              {[
                { href: "/analyze", label: "Analyze" },
                { href: "/compare", label: "Compare" },
                { href: "/chat", label: "Chat" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Main content */}
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white mt-16">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                <span className="font-semibold text-slate-800">
                  Lex<span className="text-indigo-600">AI</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs max-w-lg">
                LexAI provides AI-generated analysis for informational purposes only.
                This is not legal advice. Always consult a qualified legal professional
                for advice specific to your situation.
              </p>
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} LexAI. Built for PromptWars Virtual Hackathon.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
