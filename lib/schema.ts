const SITE_URL = "https://islandinvestorsnj.com";
const PHONE = "(609) 800-4303";
const BUSINESS_NAME = "Island Investors LLC";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: BUSINESS_NAME,
    description:
      "Island Investors LLC helps South Jersey homeowners find the best path forward — whether that's selling, refinancing, or another solution. Based in Atlantic City, NJ. No repairs, no fees, no pressure.",
    url: SITE_URL,
    telephone: PHONE,
    email: "offers@islandinvestorsnj.com",
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/logo.png`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Atlantic City",
      addressRegion: "NJ",
      postalCode: "08401",
      addressCountry: "US",
    },
    areaServed: [
      "Atlantic County, NJ",
      "Cape May County, NJ",
      "Cumberland County, NJ",
      "Salem County, NJ",
      "Gloucester County, NJ",
      "Camden County, NJ",
      "Burlington County, NJ",
      "Ocean County, NJ",
    ],
    sameAs: [],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
  };
}

export function faqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function articleSchema({
  title,
  description,
  datePublished,
  dateModified,
  slug,
  authorName = BUSINESS_NAME,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.jpg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    image: `${SITE_URL}/og-image.jpg`,
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
