import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service — Island Investors LLC",
  description: "Terms of service for Island Investors LLC and IslandInvestorsNJ.com.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div>
      <section
        className="pt-36 pb-16"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-silver-400 text-sm">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl prose prose-gray">
          <p>
            By accessing IslandInvestorsNJ.com, you agree to these terms of service.
            If you do not agree, please do not use this site.
          </p>

          <h2>Use of This Site</h2>
          <p>
            This website is operated by Island Investors LLC for informational purposes
            and to facilitate homeowner inquiries. All content is provided in good faith
            and is subject to change without notice. Nothing on this site constitutes a
            binding offer or legal advice.
          </p>

          <h2>No Obligation</h2>
          <p>
            Submitting a form or contacting us does not create any obligation on either
            party. Any agreement to purchase or sell real property must be made in a
            written contract signed by both parties.
          </p>

          <h2>Accuracy of Information</h2>
          <p>
            We make reasonable efforts to ensure the accuracy of information on this
            site, but we make no warranties of any kind, express or implied, about the
            completeness or suitability of the information provided.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            This site may contain links to third-party websites. We are not responsible
            for the content or privacy practices of those sites.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Island Investors LLC shall not be liable for any damages arising from your
            use of this website or reliance on information provided herein.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms may be directed to{" "}
            <a href="mailto:offers@islandinvestorsnj.com">offers@islandinvestorsnj.com</a>{" "}
            or <a href="tel:+16098004303">(609) 800-4303</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
