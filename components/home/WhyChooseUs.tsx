"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const benefits = [
  {
    title: "Options Before Offers",
    description: "Before anything else, we explore every realistic path — refinancing, renting, restructuring. Selling is one option, not the only one.",
  },
  {
    title: "No Repairs or Prep Work",
    description: "We work with homes in any condition. You don't need to clean, fix, or stage a thing.",
  },
  {
    title: "No Fees or Commissions",
    description: "What we offer is what you receive. No agent splits, no hidden deductions — and Island Investors typically covers standard closing costs.",
  },
  {
    title: "Close on Your Timeline",
    description: "We can move in 7 days or give you the time you need. We work around your situation, not a preset deadline.",
  },
  {
    title: "Less Disruption",
    description: "One conversation, one walkthrough. No open houses, no repeated showings, no strangers through your home.",
  },
  {
    title: "Honest Communication Throughout",
    description: "We explain our process clearly and answer every question directly. No pressure, no confusion, no runaround.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-cream-50 py-24 md:py-32" aria-labelledby="why-choose-us-heading">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-500 mb-4">
              Why Homeowners Choose Us
            </p>
            <h2
              id="why-choose-us-heading"
              className="font-display text-4xl md:text-5xl font-bold text-navy-900 leading-tight mb-6"
            >
              A Conversation, Not
              <span className="block text-gold-500">a Sales Pitch</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10">
              When a homeowner contacts Island Investors, the first step isn&apos;t
              making an offer — it&apos;s understanding the situation. We take time to
              listen, explore what options exist, and only move toward a sale if it
              genuinely makes sense for the person in front of us.
            </p>

            <ul className="space-y-5 mb-10">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex gap-4"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-sans font-semibold text-navy-800 text-sm">{benefit.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{benefit.description}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-bold font-sans text-gold-500 hover:text-gold-400 tracking-wide uppercase transition-colors"
            >
              See How It Works →
            </Link>
          </div>

          {/* Right: visual card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-navy-900 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-400 mb-6">
                Traditional Sale vs. Island Investors LLC
              </p>

              <div className="grid grid-cols-3 gap-3 text-center text-xs font-sans font-bold uppercase tracking-wider mb-4">
                <div className="text-silver-400">Factor</div>
                <div className="text-silver-400">Traditional</div>
                <div className="text-gold-400">Island Investors</div>
              </div>

              {[
                { label: "Time to Close", traditional: "60–90 days", ours: "7–30 days" },
                { label: "Repairs Needed", traditional: "Often required", ours: "Never" },
                { label: "Agent Fees", traditional: "5–6%", ours: "$0" },
                { label: "Showings", traditional: "Multiple", ours: "Less Disruption" },
                { label: "Closing Process", traditional: "May fall through", ours: "Straightforward" },
                { label: "Stress Level", traditional: "High", ours: "Minimal" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 gap-3 py-3 text-sm ${
                    i < 5 ? "border-b border-navy-700" : ""
                  }`}
                >
                  <span className="text-silver-300 font-sans text-xs">{row.label}</span>
                  <span className="text-center text-silver-400 font-sans text-xs">{row.traditional}</span>
                  <span className="text-center text-gold-400 font-sans font-semibold text-xs">{row.ours}</span>
                </div>
              ))}

              <div className="mt-8">
                <Link
                  href="/contact"
                  className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-white font-bold py-3.5 rounded-sm tracking-wide transition-colors font-sans text-sm"
                >
                  See What Path Makes Sense
                </Link>
              </div>
            </div>

            {/* Decorative corner accent */}
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-gold-500/60" />
            <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-gold-500/60" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
