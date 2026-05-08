"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import { getCounties } from "@/lib/areas";

export default function AreasPreview() {
  const counties = getCounties();

  return (
    <section className="bg-white py-24 md:py-32" aria-labelledby="areas-heading">
      <div className="section-container">
        <SectionHeader
          eyebrow="Based in Atlantic City, NJ"
          title="Rooted in South Jersey"
          subtitle="Island Investors is locally owned and based right here in Atlantic City. In many cases, we're right up the street from the homeowners we help."
          id="areas-heading"
        />

        {/* County grid */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {counties.map((county, i) => (
            <motion.div
              key={county.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href={`/areas-we-buy/${county.slug}`}
                className="group block border border-silver-100 hover:border-gold-500 bg-cream-50 hover:bg-white p-5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <h3 className="font-display text-base font-semibold text-navy-900 group-hover:text-gold-500 transition-colors mb-1">
                  {county.name}
                </h3>
                <p className="text-xs text-gray-500 font-sans">New Jersey</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Local area photo — Atlantic City coastline */}
        <div className="mt-14 relative overflow-hidden h-52 md:h-64">
          <Image
            src="/images/atlantic-city-skyline-ocean-view-island-investors.webp"
            alt="Atlantic City skyline seen across the ocean from the South Jersey shore"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 1200px"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/75 via-navy-950/40 to-navy-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 md:px-12">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-2">
                Atlantic City, NJ — Our Home Base
              </p>
              <p className="font-display text-xl md:text-2xl font-semibold text-white leading-snug max-w-md">
                We&apos;re right up the street from the homeowners we help.
              </p>
            </div>
          </div>
        </div>

        {/* Our Backyard */}
        <div className="mt-12">
          <div className="text-center mb-5">
            <p className="text-sm text-gold-500 font-sans font-bold uppercase tracking-widest mb-1">
              Our Backyard
            </p>
            <p className="text-xs text-gray-500 font-sans">
              Atlantic County communities we know best — neighborhoods we grew up around.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Atlantic City", slug: "atlantic-city-nj" },
              { label: "Pleasantville", slug: "pleasantville-nj" },
              { label: "Egg Harbor Township", slug: "egg-harbor-township-nj" },
              { label: "Galloway", slug: "galloway-nj" },
              { label: "Absecon", slug: "absecon-nj" },
              { label: "Brigantine", slug: "brigantine-nj" },
              { label: "Ventnor", slug: "ventnor-nj" },
              { label: "Margate", slug: "margate-nj" },
              { label: "Longport", slug: "longport-nj" },
              { label: "Mays Landing", slug: "mays-landing-nj" },
            ].map((city) => (
              <Link
                key={city.slug}
                href={`/areas-we-buy/${city.slug}`}
                className="px-4 py-2 text-sm text-navy-700 border border-silver-100 hover:border-gold-500 hover:text-gold-500 hover:bg-gold-100/30 transition-all duration-200 font-sans rounded-sm"
              >
                {city.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/areas-we-buy"
            className="inline-flex items-center gap-2 text-sm font-bold font-sans text-gold-500 hover:text-gold-400 tracking-wide uppercase transition-colors"
          >
            View All Service Areas →
          </Link>
        </div>
      </div>
    </section>
  );
}
