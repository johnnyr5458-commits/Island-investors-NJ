"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "30+",
    label: "Years in South Jersey",
  },
  {
    value: "Local",
    label: "Rooted in Atlantic City, NJ",
  },
  {
    value: "Flexible",
    label: "Closing on Your Timeline",
  },
  {
    value: "Zero",
    label: "Fees or Commissions",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-navy-900 border-b border-navy-700" aria-label="Trust indicators">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center relative"
            >
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-10 bg-navy-700" />
              )}
              <p className="font-accent text-4xl md:text-5xl font-light text-gold-400 mb-1">
                {stat.value}
              </p>
              <p className="font-sans text-xs uppercase tracking-widest text-silver-400 font-semibold">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
