import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PhoneButton from "@/components/shared/PhoneButton";
import SchemaMarkup from "@/components/shared/SchemaMarkup";
import { localBusinessSchema } from "@/lib/schema";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://islandinvestorsnj.com"),
  title: {
    default: "Island Investors LLC | South Jersey Real Estate Solutions",
    template: "%s | Island Investors LLC",
  },
  description:
    "Island Investors LLC helps South Jersey homeowners find the best path forward — whether that means selling, refinancing, or another solution entirely. No repairs, no fees, no pressure.",
  keywords: [
    "sell my house fast South Jersey",
    "cash home buyers NJ",
    "we buy houses South Jersey",
    "sell house as-is New Jersey",
    "South Jersey real estate solutions",
    "avoid foreclosure New Jersey",
    "sell inherited property NJ",
    "Island Investors NJ",
    "Island Investors LLC",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Island Investors LLC",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <head>
        <SchemaMarkup schema={localBusinessSchema()} />
      </head>
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        <Header />
        <main>{children}</main>
        <Footer />
        <PhoneButton />
      </body>
    </html>
  );
}
