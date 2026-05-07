import type { Metadata } from "next";

const SITE_URL = "https://islandinvestorsnj.com";
const SITE_NAME = "Island Investors NJ";
const DEFAULT_DESCRIPTION =
  "Island Investors LLC helps South Jersey homeowners find the best path forward — whether that's selling, refinancing, or another solution. Locally owned, based in Atlantic City. No repairs, no fees, no pressure.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
