import Link from "next/link";
import {
  Scale,
  FileText,
  ArrowLeftRight,
  MessageSquare,
  Shield,
  Zap,
  Users,
  CheckCircle,
} from "lucide-react";

/**
 * Landing page — showcases LexAI's features and value proposition.
 * Server component for fast initial load.
 */
export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description:
        "Upload any legal document — contract, NDA, terms of service — and get an instant plain-English breakdown with clause-by-clause analysis, risk scoring, and obligation mapping.",
      href: "/analyze",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: ArrowLeftRight,
      title: "Contract Comparison",
      description:
        "Compare two versions of a contract or two different agreements side-by-side. LexAI highlights differences, evaluates which version is more favorable, and identifies negotiation leverage points.",
      href: "/compare",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: MessageSquare,
      title: "Legal Q&A Chat",
      description:
        "Ask natural language questions about your uploaded document. LexAI provides context-grounded answers, explains legal terms, and helps you prepare informed questions for your lawyer.",
      href: "/chat",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const highlights = [
    { icon: Shield, text: "Risk scoring with color-coded alerts" },
    { icon: CheckCircle, text: "Obligation and deadline extraction" },
    { icon: Zap, text: "Instant streaming AI responses" },
    { icon: Users, text: "Plain English explanations for non-lawyers" },
    { icon: FileText, text: "Supports PDF, DOCX, and TXT" },
    { icon: Scale, text: "Generates lawyer-ready questions" },
  ];

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section
        className="text-center space-y-6 py-12"
        aria-labelledby="hero-heading"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          Powered by Google Gemini AI
        </div>

        <h1
          id="hero-heading"
          className="mx-auto max-w-3xl text-5xl font-black tracking-tight text-slate-900 leading-tight"
        >
          Legal documents,{" "}
          <span className="text-indigo-600">made simple.</span>
        </h1>

        <p className="mx-auto max-w-2xl text-xl text-slate-600 leading-relaxed">
          LexAI uses advanced AI to help you understand complex legal documents,
          compare contracts, identify risks, and prepare for conversations with
          your lawyer — all in plain English.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          role="navigation"
          aria-label="Get started"
        >
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold text-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg shadow-indigo-200"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Analyze a Document
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-slate-700 font-semibold text-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Compare Contracts
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-slate-700 font-semibold text-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            Ask Questions
          </Link>
        </div>

        {/* Disclaimer banner */}
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          🔒 Informational use only • Not legal advice • Always consult a qualified attorney
        </p>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 space-y-4 transition-all hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`Go to ${feature.title}`}
            >
              <div className={`inline-flex rounded-xl p-3 ${feature.bg}`}>
                <feature.icon
                  className={`h-6 w-6 ${feature.color}`}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 text-sm font-semibold">
                Try it →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section
        className="rounded-2xl border border-slate-200 bg-white p-8"
        aria-labelledby="highlights-heading"
      >
        <h2
          id="highlights-heading"
          className="font-bold text-slate-900 text-2xl text-center mb-8"
        >
          Everything you need to understand legal documents
        </h2>
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {highlights.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <item.icon
                className="h-5 w-5 flex-shrink-0 text-indigo-600"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-700">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works-heading">
        <h2
          id="how-it-works-heading"
          className="font-bold text-slate-900 text-2xl text-center mb-8"
        >
          How it works
        </h2>
        <ol
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          role="list"
          aria-label="Steps to use LexAI"
        >
          {[
            {
              step: "1",
              title: "Upload your document",
              desc: "Drag and drop or browse to upload your PDF, DOCX, or TXT legal document. We support up to 5MB.",
            },
            {
              step: "2",
              title: "AI analyzes instantly",
              desc: "Google Gemini AI reads every clause, identifies risks, extracts obligations, and generates a plain-English summary.",
            },
            {
              step: "3",
              title: "Take informed action",
              desc: "Review the risk score, clause breakdown, red flags, and actionable checklist. Ask follow-up questions in chat.",
            },
          ].map((item) => (
            <li key={item.step} className="text-center space-y-3">
              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-xl"
                aria-hidden="true"
              >
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
