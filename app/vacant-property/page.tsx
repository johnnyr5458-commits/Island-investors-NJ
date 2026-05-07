import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Vacant Property Help — South Jersey",
  description:
    "Own a vacant property in South Jersey? Island Investors LLC can help you understand your options — from selling to other solutions. No pressure, honest guidance.",
  path: "/vacant-property",
});

export default function VacantPropertyPage() {
  return (
    <div>
      <section
        className="pt-36 pb-20"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
                Vacant Property — South Jersey
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Vacant Property Sitting? Let&apos;s Talk Through What Makes Sense.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                A vacant property has carrying costs that don&apos;t stop — taxes,
                insurance, maintenance, risk. Island Investors LLC will help you
                understand your options clearly, whether that means selling,
                renting, or another path forward entirely.
              </p>
              <p className="text-silver-400 text-base leading-relaxed mb-8">
                No pressure. Just an honest conversation about your situation.
              </p>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Start the Conversation</h2>
              <p className="text-silver-400 text-sm mb-6">Tell us about the property — we&apos;ll help you think through your options.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Understanding Vacant Property in South Jersey
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              A vacant property isn&apos;t just an asset sitting idle — it&apos;s an active
              liability. Every month it stays empty, you&apos;re paying property taxes,
              homeowner&apos;s insurance at higher vacant-property rates, and potential
              maintenance costs. Vandalism, squatters, and code violations become
              real risks.
            </p>
            <p>
              Before we discuss any offer, we&apos;ll take time to understand your
              situation — how you came to own the property, what you&apos;ve been
              considering, and what outcome would actually work best for you.
              Sometimes selling is the right answer. Sometimes it isn&apos;t.
            </p>
            <h3>Types of Vacant Properties We Work With</h3>
            <ul>
              <li>Former rentals between tenants or after eviction</li>
              <li>Inherited homes sitting empty after a passing</li>
              <li>Second homes the owner no longer uses or needs</li>
              <li>Properties after relocating for work</li>
              <li>Homes with fire, water, or storm damage</li>
              <li>Properties that failed to sell on the open market</li>
            </ul>
            <h3>Condition Is Never an Issue</h3>
            <p>
              If selling turns out to be the right path, condition is never a
              barrier. We&apos;ve purchased vacant properties ranging from perfectly
              maintained to completely stripped. You don&apos;t need to repair, clean,
              board up, or stage anything.
            </p>
            <h3>The Conversation Is Free</h3>
            <p>
              There&apos;s no cost to reach out, no obligation to sell, and no
              pressure of any kind. If selling isn&apos;t the best solution, we&apos;ll
              still try to help you understand what options may be available.
            </p>
          </div>
          <div className="mt-10">
            <Link href="/contact" className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-8 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5">
              Start the Conversation →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
