import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { areas, getAreaBySlug, getCitiesByCounty } from "@/lib/areas";
import ContactForm from "@/components/shared/ContactForm";
import SchemaMarkup from "@/components/shared/SchemaMarkup";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) return {};

  const title = `We Buy Houses in ${area.name}, NJ — Cash Home Buyers`;
  const description = `Island Investors LLC helps homeowners in ${area.name}, New Jersey find the best path forward. Any condition, any situation — no repairs, no fees, no pressure. Free consultation.`;

  return {
    title,
    description,
    alternates: { canonical: `https://islandinvestorsnj.com/areas-we-buy/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://islandinvestorsnj.com/areas-we-buy/${slug}`,
    },
  };
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const relatedCities =
    area.type === "county"
      ? getCitiesByCounty(area.name)
      : [];

  const areaSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Island Investors LLC",
    description: `Cash home buyers serving ${area.name}, NJ`,
    url: `https://islandinvestorsnj.com/areas-we-buy/${area.slug}`,
    telephone: "(609) 800-4303",
    areaServed: {
      "@type": "City",
      name: `${area.name}, NJ`,
    },
  };

  return (
    <div>
      <SchemaMarkup schema={areaSchema} />

      {/* Hero */}
      <section
        className="pt-36 pb-20"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="pt-4">
              <nav className="flex gap-2 text-xs text-silver-400 mb-6 font-sans" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/areas-we-buy" className="hover:text-gold-400 transition-colors">Areas We Buy</Link>
                <span>/</span>
                <span className="text-gold-400">{area.name}</span>
              </nav>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
                {area.type === "county" ? "County" : "City"} — South Jersey
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                We Buy Houses in {area.name}, NJ
              </h1>
              <p className="text-silver-300 text-lg leading-relaxed mb-6">
                {area.description} No repairs needed, no commissions, no fees —
                just a fair cash offer and a closing date you choose.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-8 py-3.5 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 text-sm"
                >
                  See What Path Makes Sense →
                </Link>
                <a
                  href="tel:+16098004303"
                  className="inline-flex items-center gap-2 border border-silver-300/50 text-silver-300 hover:text-white hover:border-white font-bold px-8 py-3.5 rounded-sm transition-all duration-300 text-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (609) 800-4303
                </a>
              </div>
            </div>
            <div className="bg-navy-800 p-8">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-8 mb-8" />
              <h2 className="font-display text-xl font-bold text-white mb-2">
                Tell Us About Your {area.name} Property
              </h2>
              <p className="text-silver-400 text-sm mb-6">24-hour response. No obligation, no pressure.</p>
              <ContactForm dark />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-cream-50">
        <div className="section-container max-w-3xl">
          <h2 className="font-display text-4xl font-bold text-navy-900 mb-6">
            Selling Your {area.name} Home for Cash
          </h2>
          <div className="prose prose-gray max-w-none">
            {area.localNote ? (
              <>
                <p>{area.localNote}</p>
                <p>
                  Whatever the situation — foreclosure, an estate you&apos;ve
                  inherited, a property that&apos;s become too much to manage, a tax
                  situation that&apos;s gotten complicated — the first conversation is
                  never about making an offer. It&apos;s about understanding what
                  you&apos;re actually dealing with and what options are available to
                  you.
                </p>
              </>
            ) : (
              <>
                <p>
                  Island Investors LLC is a locally owned South Jersey real
                  estate company based in Atlantic City. We work with homeowners
                  facing foreclosure, inherited properties, tax situations, vacant
                  homes, and more — but the first conversation is never about
                  making an offer. It&apos;s about understanding your situation.
                </p>
                <p>
                  After we understand what you&apos;re dealing with, we&apos;ll help you
                  see every realistic option — and if selling makes sense, we can
                  move quickly. One walkthrough, one written offer, and a closing
                  date you choose. No repairs, no fees, no showings.
                </p>
              </>
            )}
            <h3>Why {area.name} Homeowners Work With Us</h3>
            <ul>
              <li>Options before offers — we explore every path first</li>
              <li>Any condition accepted — no repairs or cleaning needed</li>
              <li>Close in 7 to 30 days — or on your schedule</li>
              <li>Zero agent commissions or closing fees</li>
              <li>Locally owned, based in Atlantic City — 30+ years in South Jersey</li>
              <li>Honest, low-pressure process from start to finish</li>
            </ul>
            <p>
              Whatever the situation — foreclosure, estate sale, vacant property,
              tax sale, divorce, relocation — we&apos;ve seen it, and we can help you
              think through it clearly.
            </p>
          </div>

          {/* Situations */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Facing Foreclosure", href: "/foreclosure-help" },
              { label: "Inherited Property", href: "/inherited-property" },
              { label: "Vacant Property", href: "/vacant-property" },
              { label: "Behind on Taxes", href: "/tax-sale-help" },
              { label: "Divorce or Life Change", href: "/sell-your-house-fast" },
              { label: "Relocating", href: "/sell-your-house-fast" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-3 p-4 bg-white border border-silver-100 hover:border-gold-500 hover:text-gold-500 transition-all duration-200 text-sm font-sans font-semibold text-navy-800"
              >
                <span className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* County cities grid (only for county pages) */}
      {area.type === "county" && relatedCities.length > 0 && (
        <section className="py-20 bg-white">
          <div className="section-container">
            <h2 className="font-display text-3xl font-bold text-navy-900 mb-8">
              Cities We Buy In — {area.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/areas-we-buy/${city.slug}`}
                  className="p-4 border border-silver-100 bg-cream-50 text-sm font-sans text-navy-800 hover:border-gold-500 hover:text-gold-500 hover:bg-white transition-all duration-200"
                >
                  {city.name}, NJ
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="section-container">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Have a Property in {area.name}?
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            No obligation, no pressure. We&apos;ll help you understand every realistic
            option before anything else is discussed.
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
