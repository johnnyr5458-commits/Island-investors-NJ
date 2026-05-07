import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "How It Works — Sell Your House for Cash",
  description:
    "Learn how our simple 3-step process works. Request your offer, schedule a walkthrough, and pick your closing date. Sell your South Jersey home in as few as 7 days.",
  path: "/how-it-works",
});

const steps = [
  {
    number: "01",
    title: "Request Your Free Cash Offer",
    description:
      "Start by filling out our simple form or giving us a call at (609) 800-4303. Tell us about your property — the address, the condition, and your situation. There's no judgment here. We've helped homeowners through every kind of challenge imaginable.",
    detail:
      "We'll review your information and reach out within 24 hours. This step takes less than 5 minutes and there's no cost or commitment required.",
  },
  {
    number: "02",
    title: "We Do a Brief Walkthrough",
    description:
      "One of our local team members will schedule a convenient time to visit your property. This visit is quick — typically 20–30 minutes — and you don't need to do any cleaning, repairs, or preparation.",
    detail:
      "The walkthrough helps us finalize our cash offer and gives you a chance to ask us any questions you have about the process. We're transparent about everything.",
  },
  {
    number: "03",
    title: "Pick Your Closing Date and Get Paid",
    description:
      "If you accept our offer, we'll schedule closing at a local title company. You choose the date — we can close in as few as 7 days or give you more time if you need it. At closing, you receive your cash payment.",
    detail:
      "We cover all closing costs. You pay zero commissions, zero agent fees, and zero hidden charges. What we offer is what you receive.",
  },
];

const comparisons = [
  { factor: "Time to Close", us: "7–30 days", traditional: "60–90+ days" },
  { factor: "Repairs Required", us: "Never", traditional: "Often thousands" },
  { factor: "Agent Commission", us: "$0", traditional: "5–6% of sale price" },
  { factor: "Closing Costs", us: "We pay them", traditional: "2–5% of sale" },
  { factor: "Home Showings", us: "One visit", traditional: "Many showings" },
  { factor: "Deal Falling Through", us: "Never — we guarantee", traditional: "Common (financing)" },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="pt-36 pb-24"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
            Simple. Transparent. Fast.
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            How Selling Your House for Cash Works
          </h1>
          <p className="text-silver-300 text-lg leading-relaxed mb-8">
            No complicated process. No surprises. Just three straightforward steps
            from your first contact to cash in hand.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-8 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/30"
          >
            Get Started Today →
          </Link>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 md:py-32 bg-cream-50">
        <div className="section-container">
          <div className="space-y-20">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="font-accent text-8xl font-light text-gold-500/20 leading-none block mb-4">
                    {step.number}
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4 -mt-8">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>
                  <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-gold-500/40 pl-4">
                    {step.detail}
                  </p>
                </div>
                <div className={`${i % 2 === 1 ? "lg:order-1" : ""} bg-navy-900 p-10 flex items-center justify-center min-h-[200px]`}>
                  <div className="text-center">
                    <span className="font-accent text-9xl font-light text-gold-400/30">
                      {step.number}
                    </span>
                    <p className="font-display text-xl font-semibold text-white mt-2">
                      {step.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 bg-white">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-navy-900">
              Island Investors vs. Traditional Sale
            </h2>
          </div>
          <div className="border border-silver-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-navy-900 py-4 px-6 text-xs font-bold uppercase tracking-widest">
              <span className="text-silver-400">Factor</span>
              <span className="text-center text-gold-400">Island Investors</span>
              <span className="text-center text-silver-400">Traditional Sale</span>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.factor}
                className={`grid grid-cols-3 py-4 px-6 text-sm ${
                  i % 2 === 0 ? "bg-white" : "bg-cream-50"
                }`}
              >
                <span className="text-gray-700 font-semibold">{row.factor}</span>
                <span className="text-center text-gold-500 font-bold">{row.us}</span>
                <span className="text-center text-gray-400">{row.traditional}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center"
        style={{ background: "linear-gradient(135deg, #0B1C2E 0%, #112540 100%)" }}
      >
        <div className="section-container">
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Take the First Step?
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            Reach out and we&apos;ll start with a conversation — no commitment, no
            pressure, just an honest look at what options exist for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
          >
            See What Path Makes Sense →
          </Link>
        </div>
      </section>
    </div>
  );
}
