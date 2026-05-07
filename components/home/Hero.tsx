"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease },
  }),
};

const trustIndicators = [
  "Options before offers",
  "No repairs or fees",
  "Close on your timeline",
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background image via CSS — no state, no flicker */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Navy overlay — left heavy so text stays legible */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy-950/95 via-navy-950/75 to-navy-950/30" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/30" />

      {/* Coastal texture */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8962A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gold bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 z-[3] h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      <div className="section-container relative z-10 pt-32 pb-20">
        <div className="max-w-2xl">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-6"
          >
            Atlantic City, NJ · Real Estate Solutions
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.06] mb-6"
          >
            Finding the Best
            <span className="block text-gradient-gold">Path Forward</span>
            for South Jersey Homeowners.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-lg md:text-xl text-silver-300 leading-relaxed mb-10 max-w-xl"
          >
            Before an offer is ever discussed, the conversation starts with options.
            If selling makes sense for your situation, we make the process simple,
            respectful, and straightforward — with no repairs, no fees, and no pressure.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-base px-8 py-4 tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold-500/30"
            >
              See What Path Makes Sense
            </Link>
            <a
              href="tel:+16098004303"
              className="inline-flex items-center justify-center gap-2 border border-silver-300/50 hover:border-gold-400 text-silver-100 hover:text-gold-400 font-sans font-semibold text-base px-8 py-4 tracking-wide transition-all duration-300"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (609) 800-4303
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-6 text-sm text-silver-400"
          >
            {trustIndicators.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-sans tracking-widest uppercase text-silver-400">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-gold-500/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
