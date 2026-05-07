import type { Metadata } from "next";
import ContactForm from "@/components/shared/ContactForm";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Island Investors LLC — Start the Conversation",
  description:
    "Reach out to Island Investors LLC about your South Jersey property. We listen first, explore every option, and only move toward a sale if it genuinely makes sense for you.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="bg-cream-50 min-h-screen">
      {/* Hero */}
      <section
        className="py-32 md:py-40"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #0B1C2E 100%)" }}
      >
        <div className="section-container">
          <div className="max-w-xl">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
              No Pressure · No Obligation
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              See What Path
              <span className="block text-gold-400">Makes Sense</span>
            </h1>
            <p className="text-silver-300 leading-relaxed">
              Tell us about your property and your situation. We&apos;ll listen,
              ask questions, and help you understand every realistic path forward
              — not just the one that ends in a sale.
            </p>
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="section-container -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">
              Tell Us About Your Property
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Any condition. Any situation. We serve homeowners throughout South Jersey.
            </p>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact info */}
            <div className="bg-navy-900 p-7">
              <h3 className="font-display text-lg font-bold text-white mb-5">
                Prefer to Call?
              </h3>
              <a
                href="tel:+16098004303"
                className="flex items-center gap-3 text-gold-400 hover:text-gold-300 transition-colors mb-4"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-display text-xl font-semibold">(609) 800-4303</span>
              </a>
              <p className="text-silver-400 text-sm">Monday – Saturday, 8am – 8pm</p>
              <div className="mt-5 pt-5 border-t border-navy-700">
                <a
                  href="mailto:offers@islandinvestorsnj.com"
                  className="text-sm text-silver-300 hover:text-gold-400 transition-colors"
                >
                  offers@islandinvestorsnj.com
                </a>
              </div>
            </div>

            {/* Trust points */}
            <div className="bg-white border border-silver-100 p-7">
              <h3 className="font-display text-base font-semibold text-navy-900 mb-4">
                What Happens Next
              </h3>
              <ul className="space-y-3">
                {[
                  "We respond within 24 hours",
                  "We listen to your situation",
                  "We explore every option with you",
                  "If selling fits — one brief walkthrough",
                  "Written offer, zero fees or commissions",
                ].map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-accent text-gold-500 text-lg font-light">
                      {i + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Brand assurance */}
            <div className="bg-cream-50 border border-silver-100 p-7">
              <p className="text-sm text-gray-500 leading-relaxed italic">
                &ldquo;The first conversation is never about making an offer. It&apos;s about
                understanding your situation — and making sure whatever comes
                next is genuinely the right move for you.&rdquo;
              </p>
              <p className="mt-3 text-xs font-sans font-bold text-navy-700 tracking-wide">
                — Johnny Ramirez, Founder
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
