import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/hq"],
    },
    sitemap: "https://islandinvestorsnj.com/sitemap.xml",
  };
}
