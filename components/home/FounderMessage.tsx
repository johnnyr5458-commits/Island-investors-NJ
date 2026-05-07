"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const paragraphs = [
  {
    text: "Buying and selling houses isn't really the business. Helping people avoid going through what my family went through when I was younger is.",
    emphasis: true,
  },
  {
    text: "Before an offer is ever discussed, the conversation starts with options.",
    emphasis: false,
  },
];

const questions = [
  "Can the property be refinanced?",
  "Could it be rented out?",
  "Is there a way to restructure things and keep the home?",
];

const closing = [
  "If there's a realistic path that helps someone keep their property and move forward, that's the path that should be explored first.",
  "Sometimes, though, selling becomes the best solution — especially when the stress, debt, repairs, or situation surrounding the property becomes too much to carry alone.",
  "In those situations, Island Investors works to make the process simple, respectful, and straightforward.",
];

export default function FounderMessage() {
  return (
    <section
      className="relative py-28 md:py-36 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #060E1A 0%, #0B1C2E 60%, #060E1A 100%)" }}
      aria-labelledby="founder-message-heading"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.06] blur-[120px] bg-gold-500 pointer-events-none" />

      {/* Top/bottom gold lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="section-container relative z-10 max-w-4xl">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-10 text-center"
        >
          Why Island Investors Exists
        </motion.p>

        {/* Large opening quote mark */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-[120px] leading-none text-gold-500/15 select-none mb-[-40px] ml-[-8px]"
          aria-hidden="true"
        >
          &ldquo;
        </motion.div>

        {/* Opening emphasis paragraphs */}
        <div className="space-y-6 mb-10">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: i * 0.1, ease }}
              className={
                p.emphasis
                  ? "font-display text-2xl md:text-3xl font-semibold text-white leading-snug"
                  : "font-display text-xl md:text-2xl text-silver-300 leading-relaxed"
              }
            >
              {p.text}
            </motion.p>
          ))}
        </div>

        {/* Questions — offset left with gold accent */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="border-l-2 border-gold-500/40 pl-6 mb-10 space-y-3"
        >
          {questions.map((q, i) => (
            <p
              key={i}
              className="font-display text-lg md:text-xl text-silver-300 italic leading-relaxed"
            >
              {q}
            </p>
          ))}
        </motion.div>

        {/* Closing paragraphs */}
        <div className="space-y-6 mb-12">
          {closing.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
              className="font-display text-xl md:text-2xl text-silver-300 leading-relaxed"
            >
              {p}
            </motion.p>
          ))}
        </div>

        {/* Mission statement — highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="mb-12"
        >
          <div className="h-px bg-gradient-to-r from-gold-500/40 via-gold-500/20 to-transparent mb-8" />
          <p className="font-display text-xl md:text-2xl text-silver-300 leading-relaxed mb-3">
            The goal is never just to buy a house.
          </p>
          <p className="font-display text-2xl md:text-3xl font-semibold text-white leading-snug">
            The goal is to help people find the best path forward for their situation.
          </p>
          <div className="h-px bg-gradient-to-r from-gold-500/40 via-gold-500/20 to-transparent mt-8" />
        </motion.div>

        {/* Attribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="flex items-center gap-5"
        >
          {/* Monogram */}
          <div className="w-14 h-14 rounded-full border border-gold-500/40 flex items-center justify-center flex-shrink-0 bg-navy-800">
            <span className="font-display text-xl font-bold text-gold-400">JR</span>
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">
              Johnny Ramirez
            </p>
            <p className="font-sans text-sm text-silver-400 tracking-wide">
              Founder, Island Investors LLC &nbsp;·&nbsp; Atlantic City, NJ
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
