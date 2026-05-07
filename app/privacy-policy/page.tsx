import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy — Island Investors LLC",
  description: "Privacy policy for Island Investors LLC. Learn how we handle your information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div>
      <section
        className="pt-36 pb-16"
        style={{ background: "linear-gradient(160deg, #060E1A 0%, #112540 100%)" }}
      >
        <div className="section-container max-w-3xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-gold-400 mb-5">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-silver-400 text-sm">Last updated: May 2025</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl prose prose-gray">
          <p>
            Island Investors LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates IslandInvestorsNJ.com.
            This page informs you of our policies regarding the collection, use, and
            disclosure of information we receive from users of our site.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you submit a form on this site — such as a property inquiry or contact
            request — we collect the information you provide, including your name, phone
            number, email address, and property details. This information is used solely
            to respond to your inquiry and is never sold or shared with third parties for
            marketing purposes.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To respond to your inquiry and discuss your property situation</li>
            <li>To follow up regarding a potential offer or referral</li>
            <li>To improve the quality of our service</li>
          </ul>
          <p>We do not use automated systems or mass contact lists. Every inquiry is reviewed personally.</p>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties.
            We may share information with trusted professionals (such as title companies
            or real estate attorneys) only as necessary to complete a transaction you
            have agreed to.
          </p>

          <h2>Cookies</h2>
          <p>
            This site may use basic cookies for functional purposes. We do not use
            tracking cookies for advertising or third-party analytics.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about this policy, please contact us at{" "}
            <a href="mailto:offers@islandinvestorsnj.com">offers@islandinvestorsnj.com</a>{" "}
            or call <a href="tel:+16098004303">(609) 800-4303</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
