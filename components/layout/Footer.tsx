import Link from "next/link";
import Image from "next/image";

const serviceLinks = [
  { label: "Sell Your House Fast", href: "/sell-your-house-fast" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Areas We Buy", href: "/areas-we-buy" },
  { label: "Contact Us", href: "/contact" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
];

const situationLinks = [
  { label: "Foreclosure Help", href: "/foreclosure-help" },
  { label: "Inherited Property", href: "/inherited-property" },
  { label: "Vacant Property", href: "/vacant-property" },
  { label: "Tax Sale Help", href: "/tax-sale-help" },
  { label: "Surplus Funds", href: "/surplus-funds" },
];

const serviceAreas = [
  "Atlantic County",
  "Cape May County",
  "Cumberland County",
  "Salem County",
  "Gloucester County",
  "Camden County",
  "Burlington County",
  "Ocean County",
];

function PhoneIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-silver-300">
      {/* Gold top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />

      {/* Main footer */}
      <div className="section-container pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo.png"
                alt="Island Investors LLC"
                width={160}
                height={121}
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-silver-400 mb-6">
              Locally owned and based in Atlantic City, NJ — helping South Jersey
              homeowners find the best path forward since the beginning. No fees,
              no pressure, no out-of-state operators.
            </p>

            <div className="space-y-3 text-sm">
              <a
                href="tel:+16098004303"
                className="flex items-center gap-2.5 text-silver-300 hover:text-gold-400 transition-colors"
              >
                <span className="text-gold-500"><PhoneIcon /></span>
                (609) 800-4303
              </a>
              <a
                href="mailto:offers@islandinvestorsnj.com"
                className="flex items-center gap-2.5 text-silver-300 hover:text-gold-400 transition-colors"
              >
                <span className="text-gold-500"><MailIcon /></span>
                offers@islandinvestorsnj.com
              </a>
              <div className="flex items-start gap-2.5 text-silver-400">
                <span className="text-gold-500/70"><MapIcon /></span>
                <span>Atlantic City, NJ 08401<br />Serving All of South Jersey</span>
              </div>
            </div>

            {/* Hours */}
            <div className="mt-5 pt-5 border-t border-navy-800">
              <p className="text-xs text-silver-400 uppercase tracking-widest font-bold mb-2 font-sans">Hours</p>
              <p className="text-sm text-silver-400">Mon–Sat: 8am – 8pm</p>
              <p className="text-sm text-silver-400">Sun: By appointment</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-5">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-500 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Situations */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-5">
              We Can Help With
            </h3>
            <ul className="space-y-2.5">
              {situationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-500 transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick CTA */}
            <div className="mt-8 p-4 bg-navy-900 border border-navy-700">
              <p className="text-xs font-sans font-bold text-silver-300 uppercase tracking-wider mb-2">
                Ready to Sell?
              </p>
              <Link
                href="/contact"
                className="block text-center bg-gold-500 hover:bg-gold-400 text-white font-bold text-xs py-2.5 px-4 tracking-wide transition-colors uppercase"
              >
                Get Free Cash Offer
              </Link>
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-5">
              Service Areas
            </h3>
            <ul className="space-y-2.5">
              {serviceAreas.map((area) => (
                <li key={area}>
                  <Link
                    href={`/areas-we-buy/${area.toLowerCase().replace(/ /g, "-")}`}
                    className="text-sm text-silver-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-500 transition-colors flex-shrink-0" />
                    {area}, NJ
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gold divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-silver-400">
          <p>
            © {new Date().getFullYear()} Island Investors LLC. All rights reserved.
            Cash home buyers throughout South Jersey.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-gold-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" className="hover:text-gold-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
