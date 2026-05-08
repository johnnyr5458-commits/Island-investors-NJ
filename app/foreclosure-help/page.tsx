import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";
import LocalPhotoStrip from "@/components/shared/LocalPhotoStrip";

export const metadata: Metadata = buildMetadata({
  title: "Foreclosure Help South Jersey — Know Your Options",
  description:
    "Facing foreclosure in South Jersey? Island Investors LLC can help you understand all your options — and if selling makes sense, we can move quickly. Free, no-pressure consultation.",
  path: "/foreclosure-help",
});

export default function ForeclosurePage() {
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
                Foreclosure Help — South Jersey
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Facing Foreclosure? Let&apos;s Talk Through Your Options.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                If you&apos;ve received a foreclosure notice, you still have options —
                and time matters. Island Investors LLC will sit down with you, understand
                your situation, and help you find the best path forward. Selling
                is one option. We&apos;ll help you see all of them.
              </p>
              <div className="bg-navy-800/60 border border-gold-500/30 p-5 mb-8">
                <p className="text-gold-400 font-bold font-sans text-sm mb-1">Time Is a Factor</p>
                <p className="text-silver-300 text-sm">
                  The earlier we speak, the more options exist. Contact us as soon
                  as you can — even just to ask questions.
                </p>
              </div>
              <a
                href="tel:+16098004303"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-white font-bold px-8 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 mb-4 mr-4"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call (609) 800-4303
              </a>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Start the Conversation</h2>
              <p className="text-silver-400 text-sm mb-6">No obligation. We respond within hours for urgent situations.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      <LocalPhotoStrip
        src="/images/atlantic-city-area-beach-dunes-ocean-view-island-investors.webp"
        alt="Beach dunes and ocean view along the Atlantic City area coastline"
        eyebrow="South Jersey · Real Solutions"
        heading="There are options. Let's talk through them."
        position="[object-position:center_50%]"
      />

      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            What We Can Help You Explore
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Foreclosure is one of the most stressful situations a homeowner can
              face. If you&apos;ve fallen behind on mortgage payments, received a
              notice of default, or been served with foreclosure papers — the most
              important thing to know is that you still have options.
            </p>
            <p>
              Our first step is always a conversation. We&apos;ll listen, ask questions,
              and help you understand what paths are actually available in your
              situation — including options that don&apos;t involve selling at all.
            </p>
            <h3>If Selling Is the Right Move</h3>
            <p>
              For many homeowners, selling before the auction is the clearest path
              to protecting their credit, preserving equity, and regaining control.
              When that&apos;s the case, Island Investors LLC can move quickly —
              often within 7 to 14 days.
            </p>
            <ul>
              <li>We pay off the existing mortgage at closing</li>
              <li>We work with your lender if needed</li>
              <li>We stop the process before the auction date</li>
              <li>You keep any equity above what&apos;s owed</li>
            </ul>
            <h3>What If I Owe More Than the House Is Worth?</h3>
            <p>
              If your home is underwater, a short sale may be possible. While more
              complex, it&apos;s still a better outcome than a completed foreclosure,
              and we have experience navigating this with lenders. We&apos;ll be honest
              about whether it makes sense in your case.
            </p>
            <h3>This Conversation Is Free</h3>
            <p>
              There is no cost to call us, no pressure to sell, and no obligation
              of any kind. If we can help, we&apos;ll tell you how. If we can&apos;t, we&apos;ll
              say so and point you toward someone who can.
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
