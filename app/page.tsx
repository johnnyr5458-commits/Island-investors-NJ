import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import WhoWeHelp from "@/components/home/WhoWeHelp";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials"; // renders TrustSection
import FounderMessage from "@/components/home/FounderMessage";
import AreasPreview from "@/components/home/AreasPreview";
import HomeFAQ from "@/components/home/HomeFAQ";
import FinalCTA from "@/components/home/FinalCTA";
import SchemaMarkup from "@/components/shared/SchemaMarkup";
import { faqSchema } from "@/lib/schema";
import { homeFAQs } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "South Jersey Real Estate Solutions | Island Investors LLC",
  description:
    "Island Investors LLC helps South Jersey homeowners find the best path forward. We explore every option first — and if selling makes sense, we make it simple. No repairs, no fees, no pressure.",
  alternates: {
    canonical: "https://islandinvestorsnj.com",
  },
};

export default function HomePage() {
  return (
    <>
      <SchemaMarkup schema={faqSchema(homeFAQs)} />
      <Hero />
      <TrustBar />
      <WhoWeHelp />
      <HowItWorks />
      <WhyChooseUs />
      <FounderMessage />
      <Testimonials />
      <AreasPreview />
      <HomeFAQ />
      <FinalCTA />
    </>
  );
}
