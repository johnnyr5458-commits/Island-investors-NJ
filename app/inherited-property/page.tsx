import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Inherited Property in South Jersey — Understand Your Options",
  description:
    "Inherited a house in South Jersey? Island Investors LLC helps you understand every option — keeping, renting, or selling. Honest guidance with no pressure.",
  path: "/inherited-property",
});

export default function InheritedPropertyPage() {
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
                Inherited Property — South Jersey
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Inherited a Property? Let&apos;s Figure Out What Makes Sense.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                Dealing with an inherited property can feel overwhelming —
                especially while grieving, handling family responsibilities, or
                trying to figure out what comes next. Before anything else,
                Island Investors LLC will listen to your situation and help you
                understand every realistic option, whether that&apos;s selling,
                renting, or something else entirely.
              </p>
              <p className="text-silver-400 text-base leading-relaxed mb-8">
                There&apos;s no pressure and no rush. We&apos;re here to help you make
                the right decision for your family.
              </p>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Let&apos;s Talk Through Your Situation</h2>
              <p className="text-silver-400 text-sm mb-6">No obligation. We&apos;ll help you understand your options.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Inherited Property: What You Need to Know
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Inheriting a property comes with real emotional weight and real
              practical complexity. Between probate proceedings, maintenance costs,
              potential disputes with other heirs, and the pressure of managing a
              property from far away — it can become overwhelming quickly.
            </p>
            <p>
              Our first step is always understanding your situation, not making an
              offer. We&apos;ll listen, answer your questions honestly, and help you
              think through the options that actually make sense given your
              circumstances.
            </p>
            <h3>Common Situations We Help With</h3>
            <ul>
              <li>Properties that need significant repairs or cleanouts</li>
              <li>Homes with multiple heirs who need to agree on a decision</li>
              <li>Properties still in probate</li>
              <li>Out-of-state owners who can&apos;t manage the property locally</li>
              <li>Homes with deferred maintenance, tenant issues, or back taxes</li>
            </ul>
            <h3>Do I Need to Go Through Probate First?</h3>
            <p>
              In many cases, probate must be completed before a sale can proceed.
              In some situations — particularly as the sole heir or with a living
              trust — the path may be more straightforward. We&apos;ll walk through
              the situation together and help you understand what next steps may
              make the most sense.
            </p>
            <h3>What If the House Needs a Lot of Work?</h3>
            <p>
              If selling makes sense, we buy inherited homes in every condition —
              whether that means decades of belongings, structural issues, or
              outdated systems. You don&apos;t need to clean out or repair anything.
              But we&apos;ll only move toward a sale if we genuinely believe it&apos;s the
              right path for you.
            </p>
            <h3>This Conversation Costs Nothing</h3>
            <p>
              There is no charge to talk with us, no pressure to sell, and no
              obligation of any kind. Our goal is to help you make a decision you
              feel good about — whatever that decision turns out to be.
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
