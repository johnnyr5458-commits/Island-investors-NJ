"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
};

export default function HQLoginPage() {
  return (
    <div className="min-h-full flex items-center justify-center px-5 py-16">

      {/* ── Animated background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Deep ocean blue — top-left */}
        <motion.div
          animate={{ y: [0, -28, 0], x: [0, 14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(10, 50, 110, 0.38) 0%, transparent 68%)",
            filter: "blur(100px)",
          }}
        />
        {/* Warm shore light — bottom-right */}
        <motion.div
          animate={{ y: [0, 22, 0], x: [0, -18, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute -bottom-48 -right-48 w-[620px] h-[620px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(160, 110, 20, 0.20) 0%, transparent 65%)",
            filter: "blur(110px)",
          }}
        />
        {/* Horizon glow — center */}
        <motion.div
          animate={{ opacity: [0.05, 0.11, 0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[260px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(200, 150, 42, 0.14) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        {/* Subtle teal — mid-left */}
        <motion.div
          animate={{ y: [0, 18, 0], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/3 -left-24 w-[500px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 80, 100, 0.28) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[380px] flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div variants={item} className="mb-9">
          <Link href="/" aria-label="Back to Island Investors NJ">
            <Image
              src="/logo.png"
              alt="Island Investors LLC"
              width={200}
              height={151}
              className="h-24 w-auto object-contain drop-shadow-[0_4px_24px_rgba(200,150,42,0.18)]"
              priority
            />
          </Link>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          variants={item}
          className="w-full relative overflow-hidden"
          style={{
            background: "rgba(8, 22, 40, 0.70)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.45), 0 40px 100px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {/* Gold top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.65) 40%, rgba(200,150,42,0.65) 60%, transparent)" }}
          />

          <div className="px-8 pt-10 pb-9">

            {/* Badge */}
            <motion.div variants={item} className="flex justify-center mb-6">
              <span
                className="font-sans text-[9px] font-bold uppercase tracking-[0.28em] text-gold-400 px-3 py-1"
                style={{
                  background: "rgba(200,150,42,0.08)",
                  border: "1px solid rgba(200,150,42,0.20)",
                  letterSpacing: "0.22em",
                }}
              >
                Private Workspace
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={item}
              className="font-display text-[1.65rem] font-bold text-white text-center leading-tight mb-3"
            >
              Island Investors HQ
            </motion.h1>
            <motion.p
              variants={item}
              className="font-sans text-xs text-silver-500 text-center leading-relaxed mb-7"
            >
              Authorized team access only.<br />
              This workspace is not part of the public website.
            </motion.p>

            {/* Divider */}
            <div
              className="mb-7 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 50%, transparent)" }}
            />

            {/* Fields */}
            <motion.div variants={item} className="space-y-4 mb-5">
              <div>
                <label className="block font-sans text-[10px] font-semibold uppercase tracking-widest text-silver-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  placeholder="team@islandinvestorsnj.com"
                  className="w-full px-4 py-3 text-sm font-sans placeholder:text-silver-700 text-silver-700 cursor-not-allowed outline-none"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] font-semibold uppercase tracking-widest text-silver-600 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 text-sm font-sans placeholder:text-silver-700 text-silver-700 cursor-not-allowed outline-none"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                />
              </div>
            </motion.div>

            {/* Enter HQ button */}
            <motion.div variants={item}>
              <button
                disabled
                className="w-full py-3.5 font-sans font-bold text-sm tracking-[0.1em] uppercase cursor-not-allowed transition-all"
                style={{
                  background: "rgba(200,150,42,0.10)",
                  border: "1px solid rgba(200,150,42,0.22)",
                  color: "rgba(200,150,42,0.45)",
                  boxShadow: "0 0 20px rgba(200,150,42,0.04)",
                }}
              >
                Enter HQ
              </button>
            </motion.div>

            {/* Note */}
            <motion.p
              variants={item}
              className="font-sans text-[10px] text-silver-700 text-center mt-5 leading-relaxed"
            >
              Private internal access only &nbsp;·&nbsp; Authentication coming soon
            </motion.p>
          </div>

          {/* Gold bottom edge */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.20) 50%, transparent)" }}
          />
        </motion.div>

        {/* Back to site */}
        <motion.div variants={item} className="mt-7 text-center">
          <Link
            href="/"
            className="font-sans text-xs text-silver-700 hover:text-silver-400 transition-colors duration-300"
          >
            ← Return to IslandInvestorsNJ.com
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
