"use client";

import { motion } from "framer-motion";
import ContactForm from "@/components/shared/ContactForm";

export default function FinalCTA() {
  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060E1A 0%, #0B1C2E 60%, #1A3A5C 100%)" }}
      aria-labelledby="final-cta-heading"
    >
      {/* Gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10 blur-[80px] bg-gold-500 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5"
            >
              No Pressure. No Obligation.
            </motion.p>
            <motion.h2
              id="final-cta-heading"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
            >
              Ready to Talk?
              <span className="block text-gold-400">We&apos;re Here.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-silver-300 leading-relaxed mb-8"
            >
              Fill out the form and we&apos;ll reach out within 24 hours — not with a
              pitch, but with a conversation. We&apos;ll listen to your situation first
              and help you see every realistic option. Or call us directly.
            </motion.p>

            {/* Trust points */}
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3 mb-8"
            >
              {[
                "No fees or commissions",
                "No repairs or cleaning required",
                "Close in as few as 7 days",
                "We respond within 24 hours",
              ].map((point) => (
                <li key={point} className="flex items-center gap-3 text-silver-300 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </motion.ul>

            {/* Or call */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <div className="h-px flex-1 bg-navy-700" />
              <span className="text-xs text-silver-400 uppercase tracking-widest">Or call us directly</span>
              <div className="h-px flex-1 bg-navy-700" />
            </motion.div>

            <motion.a
              href="tel:+16098004303"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="inline-flex items-center gap-3 mt-6 group"
            >
              <span className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-white group-hover:text-gold-400 transition-colors">
                  (609) 800-4303
                </p>
                <p className="text-xs text-silver-400 font-sans">
                  Mon–Sat, 8am–8pm
                </p>
              </div>
            </motion.a>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-navy-800 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative"
          >
            <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
            <h3 className="font-display text-2xl font-bold text-white mb-2">
              Start the Conversation
            </h3>
            <p className="text-sm text-silver-400 mb-6">
              Takes less than 2 minutes. No obligation, no pressure.
            </p>
            <ContactForm dark />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
