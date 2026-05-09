import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllInsights, getInsight } from "@/lib/insights";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import SchemaMarkup from "@/components/shared/SchemaMarkup";
import { format } from "date-fns";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllInsights();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://islandinvestorsnj.com/two-sides-of-the-same-coin/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function InsightPage({ params }: Props) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();

  const seoSchemas = [
    articleSchema({
      title: post.title,
      description: post.description,
      datePublished: post.date,
      slug: `two-sides-of-the-same-coin/${slug}`,
    }),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      {
        name: "Two Sides of the Same Coin",
        url: "/two-sides-of-the-same-coin",
      },
      {
        name: post.title,
        url: `/two-sides-of-the-same-coin/${slug}`,
      },
    ]),
  ];

  return (
    <div className="bg-white">
      <SchemaMarkup schema={seoSchemas} />

      {/* Hero */}
      <section
        className="pt-36 pb-16"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <nav
            className="flex flex-wrap gap-2 text-xs text-silver-400 mb-6 font-sans"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-gold-400 transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/two-sides-of-the-same-coin"
              className="hover:text-gold-400 transition-colors"
            >
              Two Sides of the Same Coin
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gold-400 truncate max-w-[200px]">
              {post.title}
            </span>
          </nav>

          <div className="mb-5">
            <Link
              href="/two-sides-of-the-same-coin"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gold-400 hover:text-gold-300 transition-colors font-sans"
            >
              <span
                className="block w-4 h-px bg-gold-400"
                aria-hidden="true"
              />
              Two Sides of the Same Coin
            </Link>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-silver-300 text-lg mb-7">{post.description}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-silver-400 font-sans">
            <span>By {post.author}</span>
            <span aria-hidden="true">·</span>
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
        </div>
      </section>

      {/* Featured image placeholder */}
      <div className="section-container max-w-5xl -mt-px">
        <div
          className="w-full h-52 md:h-64 relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #060E1A 0%, #1A3A5C 100%)",
          }}
          role="img"
          aria-label="Two Sides of the Same Coin — Island Investors NJ"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 15% 50%, rgba(200,150,42,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(26,58,92,0.5) 0%, transparent 55%)",
            }}
            aria-hidden="true"
          />
          {/* Subtle center divider — the "two sides" motif */}
          <div
            className="absolute top-6 bottom-6 left-1/2 -translate-x-px w-px opacity-20"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #C8962A 30%, #C8962A 70%, transparent)",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-2">
                Two Sides of the Same Coin
              </p>
              <p className="font-display text-silver-400 text-sm">
                Island Investors NJ &nbsp;·&nbsp; South Jersey Real Estate Education
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(200,150,42,0.3), transparent)",
            }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Content */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-5xl">
            {/* Article */}
            <article
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-display prose-headings:text-navy-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:text-gray-700
                prose-li:text-gray-600 prose-li:leading-relaxed
                prose-a:text-gold-500 prose-a:no-underline hover:prose-a:text-gold-400
                prose-strong:text-navy-800
                prose-hr:border-silver-100 prose-hr:my-10"
            >
              <MDXRemote source={post.content} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-28 self-start">
              <div className="bg-navy-900 p-7">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-7 mb-7" />
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  Have a Property Question?
                </h3>
                <p className="text-silver-300 text-sm leading-relaxed mb-6">
                  Whether you&apos;re a homeowner or just want to understand your
                  options — we&apos;re happy to have an honest conversation. No pressure,
                  no obligation.
                </p>
                <Link
                  href="/contact"
                  className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-white font-bold py-3 rounded-sm text-sm tracking-wide transition-colors"
                >
                  Start the Conversation
                </Link>
                <a
                  href="tel:+16098004303"
                  className="flex items-center justify-center gap-1.5 w-full text-center mt-3 text-sm text-silver-300 hover:text-gold-400 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  (609) 800-4303
                </a>
              </div>

              <div className="bg-cream-50 border border-silver-100 p-6">
                <h3 className="font-display text-base font-semibold text-navy-900 mb-4">
                  Explore More
                </h3>
                <ul className="space-y-2.5">
                  {[
                    {
                      label: "More Two Sides Articles",
                      href: "/two-sides-of-the-same-coin",
                    },
                    { label: "How It Works", href: "/how-it-works" },
                    { label: "Foreclosure Help", href: "/foreclosure-help" },
                    { label: "Inherited Property", href: "/inherited-property" },
                    { label: "Vacant Property", href: "/vacant-property" },
                    { label: "Sell Fast", href: "/sell-your-house-fast" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-navy-700 hover:text-gold-500 transition-colors font-sans flex items-center gap-2"
                      >
                        <span
                          className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-silver-100 p-6 text-center">
                <p className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-gold-500 mb-3">
                  Island Investors NJ
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Real situations. Honest conversations. South Jersey&apos;s local
                  real estate partner.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Back to section */}
      <div className="section-container pb-16">
        <div className="max-w-5xl">
          <div className="h-px bg-silver-100 mb-8" />
          <Link
            href="/two-sides-of-the-same-coin"
            className="inline-flex items-center gap-2 text-sm font-bold text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-wider"
          >
            ← Back to Two Sides of the Same Coin
          </Link>
        </div>
      </div>
    </div>
  );
}
