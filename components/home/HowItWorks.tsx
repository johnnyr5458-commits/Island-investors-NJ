"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";

const steps = [
  {
    number: "01",
    title: "Request Your Offer",
    description:
      "Fill out our quick form or give us a call. Tell us about your property — condition doesn't matter. We'll review your information and prepare a fair cash offer within 24 hours.",
  },
  {
    number: "02",
    title: "Schedule a Brief Visit",
    description:
      "We'll do a quick walkthrough of the property — no cleaning or repairs needed. This helps us confirm our offer and answer any questions you have about the process.",
  },
  {
    number: "03",
    title: "Pick Your Closing Date",
    description:
      "Accept your offer and choose a closing date that works for you. We can close in as few as 7 days or give you the time you need. You walk away with cash — no fees, no commissions.",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-24 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #0B1C2E 0%, #112540 100%)",
      }}
      aria-labelledby="how-it-works-heading"
    >
      <div className="section-container">
        <SectionHeader
          eyebrow="The Process"
          title="Selling Your House Has Never Been This Simple"
          subtitle="Three straightforward steps. No surprises. No hidden fees. Just a fair cash offer and a closing date that works for you."
          light
          id="how-it-works-heading"
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px bg-gradient-to-r from-gold-500/40 via-gold-400/60 to-gold-500/40" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative text-center md:text-left"
            >
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-gold-500/30 bg-navy-800/60 mb-6 mx-auto md:mx-0 relative">
                <span className="font-accent text-4xl font-light text-gold-400">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-2xl font-semibold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-silver-300 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-14"
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-base px-10 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
          >
            Start With a Free Offer →
          </Link>
          <p className="mt-4 text-xs text-silver-400 font-sans">
            No obligation. No pressure. Your offer is 100% free.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
