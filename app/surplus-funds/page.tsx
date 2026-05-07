import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = buildMetadata({
  title: "New Jersey Surplus Funds — You May Be Owed Money",
  description:
    "If your South Jersey property was sold at a foreclosure or tax sale auction, you may be owed surplus funds. Island Investors LLC can help you understand your rights.",
  path: "/surplus-funds",
});

export default function SurplusFundsPage() {
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
                Surplus Funds — New Jersey
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                It May Not Be Too Late — You Could Be Owed Money.
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                In some foreclosure and tax sale situations, homeowners may still
                be entitled to surplus funds left over after the sale. Many people
                never realize the money exists — or don&apos;t know how to claim it.
                Island Investors LLC helps South Jersey homeowners understand what
                next steps may make sense.
              </p>
              <p className="text-silver-400 text-base leading-relaxed mb-8">
                This is guidance, not a pitch. There&apos;s nothing to buy and no
                pressure of any kind.
              </p>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">Ask Us a Question</h2>
              <p className="text-silver-400 text-sm mb-6">We&apos;re here to help you understand your situation — no strings attached.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Understanding Surplus Funds in New Jersey
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              When a home is sold at a foreclosure auction or tax sale for more
              than the total amount owed — mortgage, taxes, fees — the excess
              amount is called surplus funds. Under New Jersey law, these funds
              belong to the former homeowner. But many people never claim them
              because they didn&apos;t know the money existed, or didn&apos;t know where
              to start.
            </p>
            <h3>Who May Be Eligible</h3>
            <ul>
              <li>Former homeowners whose properties were sold at sheriff&apos;s sale</li>
              <li>Former owners after a tax lien foreclosure</li>
              <li>Heirs of former owners in some circumstances</li>
            </ul>
            <h3>How Surplus Funds Are Claimed in New Jersey</h3>
            <p>
              The process involves filing a motion with the court that handled
              the foreclosure. Surplus funds are typically held by the court or
              the county for a defined period of time — after which they may be
              forfeited if unclaimed. Deadlines vary, so it&apos;s worth looking into
              sooner rather than later.
            </p>
            <p>
              Island Investors works with experienced New Jersey attorneys who
              regularly handle foreclosure-related situations and surplus fund
              claims. We can connect you with someone who can help.
            </p>
            <h3>Still at Risk of Losing Your Home?</h3>
            <p>
              If you&apos;re currently facing foreclosure or a tax sale — not yet past
              it — there may be options to preserve your equity before an auction
              occurs. Reach out and we&apos;ll talk through your situation together.
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
