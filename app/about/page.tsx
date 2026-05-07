import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Island Investors LLC — South Jersey Real Estate Solutions",
  description:
    "Island Investors LLC is a locally owned South Jersey real estate company founded by Johnny Ramirez. We focus on helping homeowners find the best path forward — not just selling.",
  path: "/about",
});

const values = [
  {
    title: "Options Before Offers",
    description:
      "Before we ever discuss buying a property, we explore every realistic option with the homeowner — refinancing, renting, restructuring, or keeping the home. A sale is one path, not the default.",
  },
  {
    title: "Honesty Without Pressure",
    description:
      "We explain our process clearly, back our numbers with local data, and give homeowners the space to make decisions on their own timeline. There is never pressure to move forward.",
  },
  {
    title: "Raised Here, Rooted Here",
    description:
      "We're not a national brand or out-of-state operation. Island Investors is built on 30+ years of South Jersey life. We know these neighborhoods because we grew up in them.",
  },
  {
    title: "Respectful Communication",
    description:
      "Every conversation is treated with care. We listen before we speak, we follow through on every commitment, and we treat every homeowner the way we'd want a family member treated.",
  },
  {
    title: "Flexible Solutions",
    description:
      "No two situations are the same. We work with a network of trusted investors and professionals across New Jersey, which means we can often find a path forward even in complex situations.",
  },
  {
    title: "Transparent Process",
    description:
      "No confusing paperwork, no surprise deductions, no terms that shift at the closing table. What we agree to is what happens.",
  },
];

const counties = [
  "Atlantic County",
  "Cape May County",
  "Cumberland County",
  "Salem County",
  "Gloucester County",
  "Camden County",
  "Burlington County",
  "Ocean County",
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="pt-40 pb-24 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #0B1C2E 55%, #112540 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px] bg-gold-500 pointer-events-none" />

        <div className="section-container max-w-3xl relative z-10">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-5">
            Locally Owned · South Jersey
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            About Island Investors LLC
          </h1>
          <p className="text-silver-300 text-lg leading-relaxed max-w-2xl">
            We&apos;re a locally owned real estate solutions company based in South Jersey.
            Our focus isn&apos;t buying houses — it&apos;s helping homeowners find the
            clearest, most honest path forward for their specific situation.
          </p>
        </div>
      </section>

      {/* Founder section */}
      <section className="py-24 md:py-32 bg-cream-50">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-500 mb-4">
                The Founder
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-8">
                Johnny Ramirez
              </h2>

              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  Island Investors was founded by Johnny Ramirez — a South Jersey native
                  who has spent his entire life in this community. The company exists
                  because of something personal.
                </p>
                <p>
                  Growing up, Johnny&apos;s family went through a difficult housing
                  situation that left a lasting impression. He saw firsthand what happens
                  when homeowners don&apos;t have access to clear information, honest
                  guidance, or a trustworthy person willing to sit down and actually
                  listen to their situation.
                </p>
                <p>
                  That experience became the foundation of everything Island Investors is
                  built on. Not a buyer&apos;s list. Not a deal flow machine. A
                  relationship-first real estate company that starts every conversation
                  by asking: <em>what&apos;s the best path forward for this person?</em>
                </p>
                <p>
                  Sometimes that path is a sale. Often it means exploring other options
                  first — refinancing, renting, restructuring, or connecting the homeowner
                  with the right professional for their situation. The sale comes second.
                  The person comes first.
                </p>
              </div>
            </div>

            {/* Philosophy card */}
            <div>
              {/* Pull quote */}
              <div className="bg-navy-900 p-8 md:p-10 mb-6 relative">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                <div className="font-display text-6xl leading-none text-gold-500/20 mb-[-20px] select-none" aria-hidden="true">&ldquo;</div>
                <p className="font-display text-xl font-semibold text-white leading-relaxed mb-6">
                  The goal is never just to buy a house. The goal is to help people
                  find the best path forward for their situation.
                </p>
                <div className="flex items-center gap-4 border-t border-navy-700 pt-5">
                  <div className="w-10 h-10 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm font-bold text-gold-400">JR</span>
                  </div>
                  <div>
                    <p className="text-white font-sans font-semibold text-sm">Johnny Ramirez</p>
                    <p className="text-silver-400 font-sans text-xs">Founder, Island Investors LLC</p>
                  </div>
                </div>
              </div>

              {/* Authentic indicators */}
              <div className="bg-white border border-silver-100 p-8">
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-6">
                  What We Stand For
                </p>
                <ul className="space-y-4">
                  {[
                    "30+ years rooted in South Jersey",
                    "Locally owned — not a national brand",
                    "Options explored before any offer is made",
                    "No fees, no commissions, no hidden costs",
                    "Flexible closing — on your timeline",
                    "Direct & transparent communication",
                    "Serving homeowners across all of South Jersey",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our approach */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0B1C2E 0%, #060E1A 100%)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
        <div className="section-container max-w-3xl text-center relative z-10">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-5">
            How We Approach Every Situation
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
            The Conversation Comes First
          </h2>
          <div className="space-y-5 text-silver-300 text-lg leading-relaxed text-left">
            <p>
              When a homeowner contacts Island Investors, the first step isn&apos;t
              preparing an offer. It&apos;s listening. Understanding the property,
              the circumstances, and what outcome would genuinely serve the person best.
            </p>
            <p>
              Before a sale is ever discussed, we ask the questions that actually matter:
            </p>
          </div>

          {/* Questions */}
          <div className="border-l-2 border-gold-500/40 pl-6 my-8 text-left space-y-3">
            {[
              "Can the property be refinanced?",
              "Could it be rented out?",
              "Is there a way to restructure things and keep the home?",
              "Are there other professionals who could better serve this situation?",
            ].map((q) => (
              <p key={q} className="font-display text-xl text-silver-300 italic leading-relaxed">
                {q}
              </p>
            ))}
          </div>

          <div className="space-y-5 text-silver-300 text-lg leading-relaxed text-left">
            <p>
              If selling becomes the right answer — because of debt, stress, property
              condition, or circumstances that make holding it unrealistic — we move
              forward with a straightforward, transparent process and a fair offer.
            </p>
            <p>
              And if we can&apos;t directly help, we may be able to connect homeowners
              with trusted professionals or investors within our network who can.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-500 mb-4">
              What Guides Us
            </p>
            <h2 className="font-display text-4xl font-bold text-navy-900">
              Core Principles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-cream-50 border border-silver-100 p-8 relative">
                <div className="absolute top-0 left-6 w-8 h-px bg-gold-500/60" />
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-3 mt-2">
                  {value.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service areas */}
      <section
        className="py-24"
        style={{ background: "linear-gradient(135deg, #060E1A 0%, #0B1C2E 60%, #112540 100%)" }}
      >
        <div className="section-container">
          <div className="text-center mb-10">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-4">
              Where We Work
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Serving Homeowners Across South Jersey
            </h2>
            <p className="text-silver-400 max-w-xl mx-auto leading-relaxed">
              From the Delaware River to the shore — if you&apos;re a South Jersey
              homeowner with questions about your property, we&apos;re happy to have
              a conversation.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {counties.map((county) => (
              <Link
                key={county}
                href={`/areas-we-buy/${county.toLowerCase().replace(/ /g, "-")}`}
                className="px-5 py-2.5 text-sm text-silver-300 border border-navy-700 hover:border-gold-500/40 hover:text-gold-400 font-sans transition-colors duration-200"
              >
                {county}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
            >
              Start the Conversation →
            </Link>
            <p className="mt-4 text-sm text-silver-400 font-sans">
              No obligation. No pressure. Just an honest conversation about your situation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
