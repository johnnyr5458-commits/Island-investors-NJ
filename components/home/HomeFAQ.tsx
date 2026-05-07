"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import { homeFAQs } from "@/lib/faq-data";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-silver-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-display text-base md:text-lg font-semibold text-navy-900 group-hover:text-gold-500 transition-colors leading-snug">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 ${
            open ? "border-gold-500 bg-gold-500" : "border-silver-300"
          } flex items-center justify-center transition-all duration-300`}
        >
          <svg
            className={`w-3 h-3 ${open ? "text-white rotate-180" : "text-navy-700"} transition-all duration-300`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeFAQ() {
  return (
    <section className="bg-cream-50 py-24 md:py-32" aria-labelledby="faq-heading">
      <div className="section-container">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          subtitle="Everything you want to know about selling your South Jersey home for cash."
          id="faq-heading"
        />

        <div className="mt-12 max-w-3xl mx-auto">
          {homeFAQs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4 text-sm">Still have questions?</p>
          <a
            href="tel:+16098004303"
            className="inline-flex items-center gap-2 text-gold-500 font-bold font-sans hover:text-gold-400 transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call (609) 800-4303
          </a>
        </div>
      </div>
    </section>
  );
}
