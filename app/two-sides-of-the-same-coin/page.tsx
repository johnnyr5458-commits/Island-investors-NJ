import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getAllInsights } from "@/lib/insights";
import { format } from "date-fns";

export const metadata: Metadata = buildMetadata({
  title: "Two Sides of the Same Coin — Real Estate Education for South Jersey",
  description:
    "Real estate works better when both sides understand each other. Honest conversations, market education, and helping homeowners and investors see the full picture.",
  path: "/two-sides-of-the-same-coin",
});

export default function TwoSidesPage() {
  const posts = getAllInsights();

  return (
    <div>
      {/* Hero */}
      <section
        className="pt-36 pb-20"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-8 h-px bg-gold-500" aria-hidden="true" />
            <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              Island Investors NJ
            </p>
            <span className="block w-8 h-px bg-gold-500" aria-hidden="true" />
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Two Sides of the Same Coin
          </h1>

          <div
            className="w-16 h-0.5 mb-7"
            style={{
              background:
                "linear-gradient(90deg, #C8962A 0%, rgba(200,150,42,0.2) 100%)",
            }}
            aria-hidden="true"
          />

          <p className="text-silver-300 text-lg leading-relaxed max-w-2xl">
            Real estate works better when both sides understand each other. This
            section is dedicated to honest conversations, market education, and
            helping homeowners and investors see the full picture.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-24 bg-cream-50">
        <div className="section-container">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-navy-900 mb-4">
                Articles coming soon
              </p>
              <p className="text-gray-500">
                We&apos;re working on in-depth guides for South Jersey homeowners and
                investors. Check back soon.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-500 mb-2">
                  Education &amp; Insight
                </p>
                <h2 className="font-display text-3xl text-navy-900 font-bold">
                  Latest Articles
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/two-sides-of-the-same-coin/${post.slug}`}
                    className="group bg-white border border-silver-100 hover:border-gold-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Featured image placeholder */}
                    <div
                      className="h-44 relative overflow-hidden flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(160deg, #060E1A 0%, #1A3A5C 100%)",
                      }}
                      aria-hidden="true"
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "radial-gradient(ellipse at 25% 50%, rgba(200,150,42,0.12) 0%, transparent 60%), radial-gradient(ellipse at 75% 50%, rgba(26,58,92,0.6) 0%, transparent 60%)",
                        }}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 h-px opacity-40"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, #C8962A, transparent)",
                        }}
                      />
                      <div className="absolute bottom-4 left-5">
                        <span className="text-xs font-bold uppercase tracking-wider text-gold-400 font-sans">
                          Two Sides of the Same Coin
                        </span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col flex-1">
                      <h2 className="font-display text-xl font-semibold text-navy-900 mb-3 group-hover:text-gold-500 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">
                        {post.description}
                      </p>
                      <div className="mt-6 flex items-center justify-between border-t border-silver-100 pt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
                          <time dateTime={post.date}>
                            {format(new Date(post.date), "MMMM d, yyyy")}
                          </time>
                          {post.readTime && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{post.readTime}</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gold-500 uppercase tracking-wider group-hover:text-gold-400 transition-colors">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="section-container">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
            Have Questions?
          </p>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Let&apos;s Have an Honest Conversation
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            Whether you&apos;re a homeowner trying to understand your options or simply
            want to know where your property stands — we&apos;re here. No pressure, no
            obligation.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-gold-500 hover:bg-gold-400 text-white font-bold px-10 py-4 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5"
          >
            Start the Conversation →
          </Link>
        </div>
      </section>
    </div>
  );
}
