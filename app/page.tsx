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
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50",
      borderHover: "hover:border-indigo-300 hover:shadow-indigo-100",
    },
    {
      icon: ArrowLeftRight,
      title: "Contract Comparison",
      description:
        "Compare two versions of a contract or two different agreements side-by-side. LexAI highlights differences, evaluates which version is more favorable, and identifies negotiation leverage points.",
      href: "/compare",
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
      borderHover: "hover:border-violet-300 hover:shadow-violet-100",
    },
    {
      icon: MessageSquare,
      title: "Legal Q&A Chat",
      description:
        "Ask natural language questions about your uploaded document. LexAI provides context-grounded answers, explains legal terms, and helps you prepare informed questions for your lawyer.",
      href: "/chat",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      borderHover: "hover:border-emerald-300 hover:shadow-emerald-100",
    },
  ];

  const highlights = [
    { icon: Shield, text: "Risk scoring with color-coded alerts" },
    { icon: CheckCircle, text: "Obligation and deadline extraction" },
    { icon: Zap, text: "Instant streaming AI responses" },
    { icon: Users, text: "Plain English for non-lawyers" },
    { icon: FileText, text: "Supports PDF, DOCX, and TXT" },
    { icon: Scale, text: "Generates lawyer-ready questions" },
  ];

  return (
    <div className="space-y-24">
      {/* ── Hero ── */}
      <section className="relative" aria-labelledby="hero-heading">
        {/* Gradient backdrop */}
        <div
          className="absolute inset-0 -z-10 rounded-3xl overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/60 rounded-full blur-3xl" />
        </div>

        <div className="text-center space-y-8 py-20 px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
            Powered by Google Gemini AI
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="mx-auto max-w-3xl text-5xl sm:text-6xl font-black tracking-tight text-slate-900 leading-tight"
          >
            Legal documents,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              made simple.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-xl text-slate-500 leading-relaxed">
            LexAI uses advanced AI to help you understand complex legal documents,
            compare contracts, identify risks, and prepare for conversations with
            your lawyer — all in plain English.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            role="navigation"
            aria-label="Get started"
          >
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-white font-bold text-sm transition-all hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg shadow-indigo-200"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Analyze a Document
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-7 py-3.5 text-slate-700 font-bold text-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              Compare Contracts
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-7 py-3.5 text-slate-700 font-bold text-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Ask Questions
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-slate-400 text-xs font-medium">
            🔒 Informational use only &nbsp;•&nbsp; Not legal advice &nbsp;•&nbsp; Always consult a qualified attorney
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className={`group rounded-2xl border-2 border-slate-100 bg-white p-7 space-y-5 transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${feature.borderHover}`}
              aria-label={`Go to ${feature.title}`}
            >
              <div className={`inline-flex rounded-2xl p-3.5 ${feature.iconBg}`}>
                <feature.icon
                  className={`h-7 w-7 ${feature.iconColor}`}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-slate-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 text-sm font-bold">
                Try it now
                <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Highlights ── */}
      <section
        className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-10 shadow-sm"
        aria-labelledby="highlights-heading"
      >
        <div className="text-center mb-10">
          <h2
            id="highlights-heading"
            className="font-black text-slate-900 text-3xl"
          >
            Everything you need to understand legal documents
          </h2>
          <p className="mt-2 text-slate-500 text-base">
            All the tools a non-lawyer needs to navigate complex legal text confidently.
          </p>
        </div>
        <ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {highlights.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-white bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                <item.icon
                  className="h-5 w-5 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── How it works ── */}
      <section aria-labelledby="how-it-works-heading">
        <div className="text-center mb-12">
          <h2
            id="how-it-works-heading"
            className="font-black text-slate-900 text-3xl"
          >
            How it works
          </h2>
          <p className="mt-2 text-slate-500">Simple. Fast. Powerful.</p>
        </div>
        <ol
          className="grid grid-cols-1 gap-8 md:grid-cols-3 relative"
          role="list"
          aria-label="Steps to use LexAI"
        >
          {[
            {
              step: "1",
              title: "Upload your document",
              desc: "Drag and drop or browse to upload your PDF, DOCX, or TXT legal document. We support up to 5MB.",
              color: "bg-indigo-600",
            },
            {
              step: "2",
              title: "AI analyzes instantly",
              desc: "Google Gemini AI reads every clause, identifies risks, extracts obligations, and generates a plain-English summary.",
              color: "bg-violet-600",
            },
            {
              step: "3",
              title: "Take informed action",
              desc: "Review the risk score, clause breakdown, red flags, and actionable checklist. Ask follow-up questions in chat.",
              color: "bg-emerald-600",
            },
          ].map((item) => (
            <li key={item.step} className="text-center space-y-4 px-4">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${item.color} text-white font-black text-2xl shadow-lg`}
                aria-hidden="true"
              >
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-center shadow-xl">
        <h2 className="font-black text-white text-3xl mb-3">
          Ready to understand your legal documents?
        </h2>
        <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
          Join thousands of users who use LexAI to navigate legal complexity with confidence.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-indigo-700 font-bold text-sm hover:bg-indigo-50 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 shadow-lg"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Start Analyzing — It&apos;s Free
        </Link>
      </section>
    </div>
  );
}
