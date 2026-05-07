"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";

const reasons = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Local South Jersey Buyer",
    description: "We operate right here in South Jersey — not a national call center. We know the neighborhoods, the counties, and the market.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Direct Cash Offers",
    description: "No bank financing, no contingencies. We make a direct cash offer so closing is certain and fast — no deals falling through at the last minute.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "No Repairs Needed",
    description: "Sell as-is. We buy homes regardless of condition — fire damage, code violations, deferred maintenance. You don't touch a thing.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: "No Agent Commissions",
    description: "You keep the full offer amount. No listing fees, no buyer's agent splits, no closing cost surprises. What we offer is what you receive.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    ),
    title: "Flexible Closing Timeline",
    description: "Close in 7 days or take 60 — we work around your schedule. Moving, settling an estate, or just need more time? We accommodate.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    title: "Straightforward Communication",
    description: "No pressure tactics, no confusing language. We explain our offer clearly, answer every question honestly, and respect your decision either way.",
  },
];

const situations = [
  "Vacant properties",
  "Inherited homes",
  "Foreclosure pressure",
  "Tired landlords",
  "Fire-damaged homes",
  "Repair-heavy properties",
  "Fast, private sales",
  "Out-of-state owners",
  "Code violation properties",
  "Tax-delinquent homes",
  "Divorce situations",
  "Estate sales",
];

export default function TrustSection() {
  return (
    <section
      className="py-24 md:py-32"
      style={{ background: "linear-gradient(180deg, #0B1C2E 0%, #060E1A 100%)" }}
      aria-labelledby="trust-heading"
    >
      <div className="section-container">

        {/* ── Part 1: Why Sellers Choose Us ── */}
        <SectionHeader
          eyebrow="Why Sellers Choose Island Investors"
          title="Built on Honesty. Backed by Results."
          subtitle="We don't rely on pressure or promises we can't keep. Here's exactly what working with us looks like."
          light
          id="trust-heading"
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-navy-800 p-7 relative group"
            >
              {/* Gold top accent */}
              <div className="absolute top-0 left-7 right-7 h-px bg-gradient-to-r from-gold-500/0 via-gold-500/50 to-gold-500/0" />

              <div className="w-11 h-11 rounded-sm bg-navy-900 border border-navy-700 flex items-center justify-center text-gold-400 mb-5 group-hover:border-gold-500/40 transition-colors duration-300">
                {item.icon}
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-silver-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Part 2: Our Promise ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 relative bg-navy-800 p-10 md:p-14 text-center"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
          <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-gold-500/40" />
          <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-gold-500/40" />
          <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-gold-500/40" />
          <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-gold-500/40" />

          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
            Our Promise
          </p>
          <blockquote className="font-display text-xl md:text-2xl font-semibold text-white leading-relaxed max-w-3xl mx-auto mb-6">
            &ldquo;At Island Investors, trust comes before the transaction. We don&apos;t
            believe in pressure, fake promises, or confusing paperwork. Our goal
            is simple: give South Jersey property owners a clear cash-sale option
            so they can make the decision that is best for them.&rdquo;
          </blockquote>
          <p className="text-sm text-gold-400 font-sans font-semibold tracking-wide">
            — Island Investors LLC
          </p>
        </motion.div>

        {/* ── Part 3: Real Situations ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20"
        >
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-4 text-center">
            Real Situations We Help With
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-10">
            Whatever the Circumstance, We&apos;re Ready
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {situations.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="inline-flex items-center gap-2 bg-navy-800 border border-navy-700 hover:border-gold-500/40 px-5 py-2.5 text-sm text-silver-300 font-sans transition-colors duration-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                {s}
              </motion.span>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-sm px-8 py-4 tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
            >
              Talk to Us About Your Property
            </Link>
            <p className="mt-3 text-xs text-silver-400 font-sans">
              No obligation. No pressure. We answer 7 days a week.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
