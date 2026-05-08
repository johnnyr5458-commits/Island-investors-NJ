import type { Metadata } from "next";
import Image from "next/image";
import { buildMetadata } from "@/lib/metadata";
import PartnerForm from "./PartnerForm";
import LocalPhotoStrip from "@/components/shared/LocalPhotoStrip";

export const metadata: Metadata = buildMetadata({
  title: "Partner With Island Investors — Local Real Estate Network",
  description:
    "Join Island Investors' trusted local network. We collaborate with investors, rehabbers, landlords, and real estate professionals across South Jersey and New Jersey. Build long-term relationships built on trust.",
  path: "/partner",
});

const benefits = [
  {
    title: "Experience Across Different Situations",
    description:
      "Every homeowner's situation is different. Island Investors works with local investment partners who understand how to approach difficult circumstances with professionalism, patience, and respect.",
  },
  {
    title: "Built On Shared Standards",
    description:
      "We work best with local investment partners who believe communication matters, homeowners deserve honesty, and long-term relationships are more important than short-term wins.",
  },
  {
    title: "Local Relationships That Matter",
    description:
      "While Island Investors is rooted in Atlantic City and South Jersey, we've built strong relationships with experienced professionals throughout New Jersey who share the way we believe business should be done.",
  },
];

export default function PartnerPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section
        className="pt-40 pb-24 relative overflow-hidden"
      >
        {/* Real local photo: Atlantic City bayfront homes with water view */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/atlantic-city-bayfront-homes-water-view.webp"
            alt="Atlantic City bayfront homes with water view"
            fill
            priority
            className="object-cover [object-position:center_50%]"
            sizes="100vw"
          />
        </div>
        {/* Left-heavy gradient — lets bayfront homes and water show on the right */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy-950/82 via-navy-950/52 to-navy-950/20" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy-950/28 via-transparent to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-navy-950/18 via-transparent to-navy-950/28" />
        <div className="absolute top-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="section-container max-w-3xl relative z-[3]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-5">
            For Investors &amp; Real Estate Professionals
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Partner With
            <span className="block text-gradient-gold">Island Investors</span>
          </h1>
          <p className="text-silver-300 text-lg leading-relaxed mb-4 max-w-2xl">
            Not every investor is the right fit for how we operate. Island Investors works with local investment partners who believe in transparency, professionalism, and doing right by homeowners.
          </p>
          <p className="text-silver-400 text-base leading-relaxed max-w-2xl">
            If you&apos;re an investor, rehabber, landlord, or real estate professional looking
            to build a long-term relationship with a trusted local real estate solutions team, we&apos;d like to get to know you.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-cream-50">
        <div className="section-container">
          <div className="text-center mb-14">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-500 mb-4">
              What a Partnership Looks Like
            </p>
            <h2 className="font-display text-4xl font-bold text-navy-900">
              Built on Trust. Driven by Results.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white border border-silver-100 p-7 hover:border-gold-500/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300"
              >
                <div className="w-8 h-px bg-gold-500 mb-5" />
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-3">
                  {b.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local photo break — boardwalk and Atlantic City identity */}
      <LocalPhotoStrip
        src="/images/atlantic-city-boardwalk-kingston-avenue-oceanfront.webp"
        alt="Atlantic City boardwalk near Kingston Avenue and oceanfront homes"
        eyebrow="Atlantic City · South Jersey"
        heading="Local roots. Professional standards. Long-term relationships."
        position="[object-position:center_55%]"
      />

      {/* Network note */}
      <section className="py-16 bg-white border-y border-silver-100">
        <div className="section-container max-w-3xl text-center">
          <p className="font-display text-2xl md:text-3xl font-semibold text-navy-900 leading-snug mb-4">
            &ldquo;We work with a network of experienced investors throughout New Jersey.
            If we can&apos;t directly help with a situation ourselves, we may still be able
            to connect homeowners with trusted professionals who can.&rdquo;
          </p>
          <p className="text-sm text-silver-400 font-sans font-semibold tracking-wide uppercase">
            — Island Investors LLC
          </p>
        </div>
      </section>

      {/* Inquiry Form */}
      <section
        className="py-24 md:py-32"
        style={{ background: "linear-gradient(135deg, #060E1A 0%, #0B1C2E 60%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <div className="text-center mb-12">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-4">
              Let&apos;s Connect
            </p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Start a Conversation
            </h2>
            <p className="text-silver-400 leading-relaxed">
              Tell us a bit about yourself and what you&apos;re looking for. We&apos;ll
              follow up personally — no automated responses, no sales pitch.
            </p>
          </div>

          <PartnerForm />
        </div>
      </section>
    </div>
  );
}
