import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/posts";
import { articleSchema } from "@/lib/schema";
import SchemaMarkup from "@/components/shared/SchemaMarkup";
import { format } from "date-fns";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://islandinvestorsnj.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const schema = articleSchema({
    title: post.title,
    description: post.description,
    datePublished: post.date,
    slug,
  });

  return (
    <div className="bg-white">
      <SchemaMarkup schema={schema} />

      {/* Hero */}
      <section
        className="pt-36 pb-16"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <nav className="flex gap-2 text-xs text-silver-400 mb-6 font-sans" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gold-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gold-400 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gold-400 truncate max-w-[200px]">{post.title}</span>
          </nav>
          <div className="flex gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs font-bold uppercase tracking-wider text-gold-400 font-sans">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            {post.title}
          </h1>
          <p className="text-silver-300 text-lg mb-6">{post.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-silver-400 font-sans">
            <span>By {post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.date}>{format(new Date(post.date), "MMMM d, yyyy")}</time>
            {post.readTime && (
              <>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 max-w-5xl">
            {/* Article */}
            <article className="prose prose-lg prose-gray max-w-none prose-headings:font-display prose-headings:text-navy-900 prose-a:text-gold-500 prose-a:no-underline hover:prose-a:text-gold-400 prose-strong:text-navy-800">
              <MDXRemote source={post.content} />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-navy-900 p-7">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent -mx-7 mb-7" />
                <h3 className="font-display text-lg font-bold text-white mb-3">
                  Ready to Sell?
                </h3>
                <p className="text-silver-300 text-sm leading-relaxed mb-6">
                  Get a free, no-obligation cash offer for your South Jersey home.
                  We respond within 24 hours.
                </p>
                <Link
                  href="/contact"
                  className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-white font-bold py-3 rounded-sm text-sm tracking-wide transition-colors"
                >
                  See What Path Makes Sense
                </Link>
                <a
                  href="tel:+16098004303"
                  className="flex items-center justify-center gap-1.5 w-full text-center mt-3 text-sm text-silver-300 hover:text-gold-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (609) 800-4303
                </a>
              </div>

              <div className="bg-cream-50 border border-silver-100 p-6">
                <h3 className="font-display text-base font-semibold text-navy-900 mb-4">
                  We Help With:
                </h3>
                <ul className="space-y-2">
                  {[
                    { label: "Foreclosure Help", href: "/foreclosure-help" },
                    { label: "Inherited Property", href: "/inherited-property" },
                    { label: "Vacant Property", href: "/vacant-property" },
                    { label: "Tax Sale Help", href: "/tax-sale-help" },
                    { label: "Sell Fast", href: "/sell-your-house-fast" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-navy-700 hover:text-gold-500 transition-colors font-sans flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-gold-500 flex-shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Back to blog */}
      <div className="section-container pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-wider"
        >
          ← Back to All Articles
        </Link>
      </div>
    </div>
  );
}
