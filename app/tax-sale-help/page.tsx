import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Tax Sale Help South Jersey — Know Your Options Before It&apos;s Too Late",
  description:
    "Behind on property taxes in South Jersey? Island Investors LLC helps you understand every available option before a tax sale occurs. Free consultation, no pressure.",
  path: "/tax-sale-help",
});

export default function TaxSalePage() {
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
                Tax Sale Help — South Jersey
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Behind on Property Taxes? Let&apos;s Look at Your Options.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-4">
                Delinquent property taxes can lead to tax lien certificates and
                ultimately a tax sale — but there are usually more options than
                people realize. Island Investors LLC will help you understand
                what&apos;s available before any deadline arrives.
              </p>
              <div className="bg-navy-800/60 border border-gold-500/30 p-5 mb-8">
                <p className="text-gold-400 font-bold font-sans text-sm mb-1">Time Matters Here</p>
                <p className="text-silver-300 text-sm">
                  Contact us as soon as possible — the earlier we connect, the
                  more options are realistically on the table.
                </p>
              </div>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Start the Conversation</h2>
              <p className="text-silver-400 text-sm mb-6">We prioritize urgent tax situations. No obligation.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Understanding New Jersey Tax Sales
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              In New Jersey, unpaid property taxes result in a tax lien that can
              be sold to a third party at a public tax sale. Once sold, the lien
              holder can charge additional interest and ultimately foreclose on
              your property if the lien isn&apos;t paid off.
            </p>
            <p>
              Our first step is always understanding your full situation — not just
              the tax balance, but the equity in the property, your goals, your
              timeline, and what you&apos;ve already explored. From there, we can help
              you see every realistic path forward.
            </p>
            <h3>What Selling Can Accomplish</h3>
            <p>
              For many homeowners, selling before or shortly after a tax sale is
              the clearest path to resolving the situation and keeping equity that
              would otherwise be lost. When that&apos;s the right call, Island
              Investors LLC can move quickly.
            </p>
            <ul>
              <li>Delinquent property taxes paid at closing</li>
              <li>Outstanding tax lien certificates cleared</li>
              <li>Accrued interest and penalties handled</li>
              <li>Existing mortgage paid off as part of the transaction</li>
              <li>Remaining equity goes to you</li>
            </ul>
            <h3>Other Options Worth Exploring First</h3>
            <p>
              Depending on your situation, there may be payment plans,
              hardship programs, or refinancing options worth looking at before
              selling. We&apos;ll help you think through what makes sense — and we&apos;ll
              tell you honestly if selling isn&apos;t your best move.
            </p>
            <h3>This Conversation Is Free</h3>
            <p>
              There&apos;s no charge to call, no obligation to do anything, and no
              pressure of any kind. We work with local title companies experienced
              in New Jersey tax situations, and we can help you understand your
              position clearly before any decision is made.
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
