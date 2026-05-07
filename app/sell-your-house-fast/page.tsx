import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "Sell Your House Fast in South Jersey — Island Investors LLC",
  description:
    "Need to sell your South Jersey home quickly? Island Investors LLC starts with your situation, not an offer. No repairs, no fees, no commissions. Close on your timeline.",
  path: "/sell-your-house-fast",
});

const benefits = [
  "No repairs or cleaning required",
  "No real estate agent fees",
  "No open houses or showings",
  "Close in 7 to 30 days — or on your schedule",
  "Cash payment at closing",
  "Any condition accepted",
  "Any situation considered",
  "Locally owned and operated",
];

export default function SellFastPage() {
  return (
    <div>
      {/* Hero */}
      <section
        className="pt-36 pb-20"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
                South Jersey Home Sales
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Need to Sell? Let&apos;s Start with Your Situation.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                Island Investors LLC buys homes throughout South Jersey — but we
                don&apos;t lead with an offer. We lead with a conversation. Before
                anything is discussed, we take time to understand your situation
                and make sure selling is genuinely the right move.
              </p>
              <p className="text-silver-400 text-base leading-relaxed mb-8">
                If it is, we can move quickly, handle everything, and close on
                your timeline — with no repairs, no agent fees, and no pressure.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {benefits.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-silver-300">
                    <span className="w-4 h-4 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2 h-2 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            {/* Form */}
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Start the Conversation
              </h2>
              <p className="text-silver-400 text-sm mb-6">No obligation. We respond within 24 hours.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Why South Jersey Homeowners Work With Island Investors LLC
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              The traditional home sale in South Jersey takes months — preparation,
              repairs, showings, negotiations, and waiting with no certainty the
              deal closes. For homeowners in time-sensitive situations, that process
              doesn&apos;t work.
            </p>
            <p>
              But before we talk about a sale at all, we talk about your situation.
              What&apos;s driving the need to sell? What matters most to you about how
              this goes? Are there other paths worth considering? We ask these
              questions because the right answer isn&apos;t always selling — and we&apos;d
              rather help you make the right decision than close a deal that wasn&apos;t
              the best move.
            </p>
            <h3>When Selling Is the Right Call</h3>
            <p>
              For many homeowners facing tight timelines, difficult properties, or
              situations where the traditional market simply isn&apos;t a realistic
              option — a direct sale to Island Investors LLC is the cleanest path.
              When that&apos;s the case, we can close in as few as 7 to 14 business
              days, or on whatever schedule actually works for you.
            </p>
            <h3>Do I Need to Make Repairs or Clean the Property?</h3>
            <p>
              Never. We buy homes in all conditions — fire damage, water damage,
              code violations, outdated systems, overgrown yards, decades of
              belongings, and more. We evaluate what we can work with, and we
              explain exactly how we arrived at any offer we make.
            </p>
            <h3>What Will I Receive for My Home?</h3>
            <p>
              Our offers are based on the current South Jersey market, comparable
              sales in your area, and the realistic condition of the property. We
              explain our reasoning clearly. No mystery, no lowball tactics, no
              pressure to accept anything — just a transparent number and an honest
              conversation about whether it makes sense for you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="section-container">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to Talk? We&apos;re Here.
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            No obligation, no pressure. Just an honest conversation about your
            property and what options make the most sense.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5"
            >
              See What Path Makes Sense →
            </Link>
            <a
              href="tel:+16098004303"
              className="inline-flex items-center justify-center gap-2 border border-silver-300/50 text-silver-300 hover:text-white hover:border-white font-bold px-10 py-4 rounded-sm transition-all duration-300"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (609) 800-4303
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
