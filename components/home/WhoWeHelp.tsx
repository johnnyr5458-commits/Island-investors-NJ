"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const situations = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: "Facing Foreclosure",
    description: "Behind on mortgage payments? We can close fast enough to stop the process and protect your credit.",
    href: "/foreclosure-help",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Inherited Property",
    description: "Inherited a house you don't want to manage? We handle the complexity so you don't have to.",
    href: "/inherited-property",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
      </svg>
    ),
    title: "Vacant or Problem Home",
    description: "Sitting on an empty or difficult property? Stop paying carrying costs — we'll take it off your hands.",
    href: "/vacant-property",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />
      </svg>
    ),
    title: "Behind on Tax Payments",
    description: "Delinquent property taxes can snowball fast. We buy tax-burdened homes and settle everything at closing.",
    href: "/tax-sale-help",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "Divorce or Life Change",
    description: "Life transitions are hard enough. We make the home sale simple, private, and on your timeline.",
    href: "/sell-your-house-fast",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: "Relocating or Downsizing",
    description: "Moving for work or simplifying your life? Sell fast without waiting months on the open market.",
    href: "/sell-your-house-fast",
  },
];

export default function WhoWeHelp() {
  return (
    <section className="overflow-hidden bg-cream-50" aria-labelledby="who-we-help-heading">

      {/* Image-backed section header — South Jersey neighborhood feel */}
      <div className="relative overflow-hidden h-56 md:h-72">
        <Image
          src="/images/atlantic-city-residential-street-white-porches.webp"
          alt="Atlantic City residential street with white porches and parked cars"
          fill
          className="object-cover [object-position:center_45%]"
          sizes="100vw"
          loading="lazy"
        />
        {/* Overlay — lightened so neighborhood detail shows through */}
        <div className="absolute inset-0 bg-navy-950/52" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/35 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-3">
            Who We Help
          </p>
          <h2
            id="who-we-help-heading"
            className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-3"
          >
            Whatever Your Situation,
            <span className="block">We Have a Solution</span>
          </h2>
          <p className="text-silver-300 text-sm leading-relaxed max-w-lg hidden md:block">
            We&apos;ve helped South Jersey homeowners through every kind of challenging
            real estate situation — quickly, fairly, and with zero hassle.
          </p>
        </div>
      </div>

      {/* Subtitle visible on mobile only (below image) */}
      <div className="section-container pt-8 pb-0 md:hidden">
        <p className="text-gray-600 text-sm leading-relaxed">
          We&apos;ve helped South Jersey homeowners through every kind of challenging
          real estate situation — quickly, fairly, and with zero hassle.
        </p>
      </div>

      {/* Card grid */}
      <div className="section-container py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {situations.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                href={item.href}
                className="group block bg-white border border-silver-100 p-7 hover:border-gold-500/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 h-full"
              >
                {/* Icon with gold accent */}
                <div className="w-12 h-12 rounded-sm bg-navy-900 flex items-center justify-center text-gold-400 mb-5 group-hover:bg-gold-500 group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-2 group-hover:text-gold-500 transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">
                  {item.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-500 group-hover:gap-2.5 transition-all duration-200">
                  Learn More
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
