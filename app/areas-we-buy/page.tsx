import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getCounties, getCitiesByCounty } from "@/lib/areas";
import LocalPhotoStrip from "@/components/shared/LocalPhotoStrip";

export const metadata: Metadata = buildMetadata({
  title: "Areas We Buy Houses In — South Jersey",
  description:
    "Island Investors LLC serves homeowners throughout South Jersey. View all counties and cities we buy in — Atlantic, Cape May, Cumberland, Salem, Gloucester, Camden, Burlington, and Ocean County.",
  path: "/areas-we-buy",
});

export default function AreasPage() {
  const counties = getCounties();

  return (
    <div>
      {/* Hero */}
      <section
        className="pt-36 pb-24 relative overflow-hidden"
      >
        {/* Real local photo: Atlantic City casino skyline and oceanfront */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/atlantic-city-casino-skyline-oceanfront-island-investors.webp"
            alt="Atlantic City casino skyline and oceanfront view from the South Jersey coast"
            fill
            priority
            className="object-cover object-bottom"
            sizes="100vw"
          />
        </div>
        {/* Left-heavy gradient — lets the Atlantic City skyline show on the right */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy-950/80 via-navy-950/50 to-navy-950/18" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-navy-950/28 via-transparent to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-navy-950/18 via-transparent to-transparent" />
        <div className="section-container max-w-3xl relative z-[2]">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
            Based in Atlantic City · Serving South Jersey
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Areas We Buy Houses In South Jersey
          </h1>
          <p className="text-silver-300 text-lg leading-relaxed">
            Island Investors LLC is based right here in Atlantic City and serves
            homeowners throughout South Jersey. In many cases, we&apos;re right up the
            street from the people we help — which means when you call, you&apos;re
            speaking with someone who genuinely understands the area, the
            neighborhoods, and the situations local homeowners face.
          </p>
        </div>
      </section>

      {/* Counties + cities */}
      <section className="py-24 bg-cream-50">
        <div className="section-container">
          <div className="space-y-16">
            {counties.map((county) => {
              const cities = getCitiesByCounty(county.name);
              return (
                <div key={county.slug}>
                  <div className="flex items-center gap-4 mb-8">
                    <Link
                      href={`/areas-we-buy/${county.slug}`}
                      className="font-display text-2xl md:text-3xl font-bold text-navy-900 hover:text-gold-500 transition-colors"
                    >
                      {county.name}, NJ
                    </Link>
                    <div className="flex-1 h-px bg-silver-100" />
                    <Link
                      href={`/areas-we-buy/${county.slug}`}
                      className="text-xs font-bold uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors whitespace-nowrap"
                    >
                      View County →
                    </Link>
                  </div>
                  {cities.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {cities.map((city) => (
                        <Link
                          key={city.slug}
                          href={`/areas-we-buy/${city.slug}`}
                          className="px-4 py-3 bg-white border border-silver-100 text-sm font-sans text-navy-800 hover:border-gold-500 hover:text-gold-500 hover:bg-cream-50 transition-all duration-200"
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Local photo break — South Jersey bayfront */}
      <LocalPhotoStrip
        src="/images/south-jersey-bayfront-waterfront-reflection-island-investors.webp"
        alt="Quiet South Jersey bayfront water view with morning reflections"
        eyebrow="South Jersey · Your Neighborhood"
        heading="From the Delaware River to the shore, we buy here."
        position="[object-position:center_40%]"
      />

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="section-container">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Don&apos;t See Your City? We Still Buy There.
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            We cover all of South Jersey. If your city isn&apos;t listed, contact us
            — we almost certainly buy in your area.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5"
          >
            See What Path Makes Sense →
          </Link>
        </div>
      </section>
    </div>
  );
}
