import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getAllPosts } from "@/lib/posts";
import { format } from "date-fns";

export const metadata: Metadata = buildMetadata({
  title: "South Jersey Real Estate Blog",
  description:
    "Expert guides, tips, and insights for South Jersey homeowners. Learn about selling your home fast, foreclosure prevention, inherited property, and more.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      {/* Hero */}
      <section
        className="pt-36 pb-20"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">
            South Jersey Real Estate
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Real Estate Tips for South Jersey Homeowners
          </h1>
          <p className="text-silver-300 text-lg leading-relaxed">
            Expert guides and actionable advice on selling your home, avoiding
            foreclosure, handling inherited property, and more — written for
            South Jersey homeowners.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-24 bg-cream-50">
        <div className="section-container">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-navy-900 mb-4">
                Articles coming soon
              </p>
              <p className="text-gray-500">
                We&apos;re working on helpful guides for South Jersey homeowners.
                Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white border border-silver-100 hover:border-gold-500 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      {post.tags.slice(0, 1).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-bold uppercase tracking-wider text-gold-500 font-sans"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-display text-xl font-semibold text-navy-900 mb-3 group-hover:text-gold-500 transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">
                      {post.description}
                    </p>
                    <div className="mt-6 flex items-center justify-between border-t border-silver-100 pt-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-sans">
                        <span>{format(new Date(post.date), "MMMM d, yyyy")}</span>
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
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-center">
        <div className="section-container">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Have a Property in South Jersey?
          </h2>
          <p className="text-silver-300 mb-8 max-w-xl mx-auto">
            We help homeowners throughout South Jersey understand every option —
            no pressure, no obligation, just an honest conversation about your
            situation.
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
