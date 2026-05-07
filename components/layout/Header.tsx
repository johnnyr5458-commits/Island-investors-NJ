"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const navLinks = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Areas We Buy", href: "/areas-we-buy" },
  { label: "About", href: "/about" },
  { label: "Partners", href: "/partner" },
  { label: "Blog", href: "/blog" },
];

const situationLinks = [
  { label: "Foreclosure Help", href: "/foreclosure-help" },
  { label: "Inherited Property", href: "/inherited-property" },
  { label: "Vacant Property", href: "/vacant-property" },
  { label: "Tax Sale Help", href: "/tax-sale-help" },
  { label: "Surplus Funds", href: "/surplus-funds" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [situationsOpen, setSituationsOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setBarVisible(window.scrollY < 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top announcement bar */}
      <div
        className={twMerge(
          "fixed top-0 left-0 right-0 z-[60] bg-navy-950 border-b border-navy-800 transition-all duration-300 overflow-hidden",
          barVisible ? "h-9 opacity-100" : "h-0 opacity-0"
        )}
      >
        <div className="section-container h-full flex items-center justify-between">
          <p className="text-xs font-sans text-silver-400 tracking-wide hidden sm:block">
            <span className="text-gold-400 font-semibold">Island Investors LLC</span>
            {" "}— South Jersey&apos;s Trusted Cash Home Buyers
          </p>
          <div className="flex items-center gap-5 ml-auto">
            <a
              href="tel:+16098004303"
              className="text-xs font-sans font-semibold text-silver-300 hover:text-gold-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (609) 800-4303
            </a>
            <a
              href="mailto:offers@islandinvestorsnj.com"
              className="text-xs font-sans font-semibold text-silver-300 hover:text-gold-400 transition-colors hidden md:flex items-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              offers@islandinvestorsnj.com
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={twMerge(
          "fixed left-0 right-0 z-50 transition-all duration-500",
          barVisible ? "top-9" : "top-0",
          scrolled
            ? "bg-navy-900/96 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        )}
      >
        {/* Bottom border on scroll */}
        <div className={twMerge("absolute bottom-0 left-0 right-0 h-px transition-opacity duration-500", scrolled ? "opacity-100" : "opacity-0")}
          style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.3), transparent)" }}
        />

        <div className="section-container">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group" aria-label="Island Investors LLC — Home">
              <Image
                src="/logo.png"
                alt="Island Investors LLC"
                width={160}
                height={121}
                className="h-[52px] w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-xs font-sans font-bold text-silver-100 hover:text-gold-400 tracking-[0.12em] transition-colors duration-200 uppercase group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </Link>
              ))}
              {/* Situations dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setSituationsOpen(true)}
                onMouseLeave={() => setSituationsOpen(false)}
              >
                <button className="relative px-4 py-2 text-xs font-sans font-bold text-silver-100 hover:text-gold-400 tracking-[0.12em] transition-colors duration-200 uppercase flex items-center gap-1 group">
                  Situations
                  <svg className={twMerge("w-3 h-3 mt-0.5 transition-transform duration-200", situationsOpen ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={twMerge(
                  "absolute top-full left-0 w-56 bg-navy-900 border border-navy-700 shadow-[0_16px_50px_rgba(0,0,0,0.6)] py-2 transition-all duration-200",
                  situationsOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                )}>
                  {/* Gold top accent */}
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
                  {situationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm text-silver-300 hover:text-gold-400 hover:bg-navy-800 transition-colors duration-150 font-sans group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold-500/50 group-hover:bg-gold-500 transition-colors flex-shrink-0" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+16098004303"
                className="text-xs font-sans font-semibold text-silver-300 hover:text-gold-400 tracking-wide transition-colors duration-200 flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (609) 800-4303
              </a>
              <Link
                href="/contact"
                className="bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-xs px-5 py-2.5 tracking-[0.1em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/25"
              >
                See My Options
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <div className="w-6 space-y-1.5">
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={twMerge(
          "lg:hidden bg-navy-900 border-t border-navy-700 overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-screen" : "max-h-0"
        )}>
          <nav className="section-container py-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-silver-100 hover:text-gold-400 font-sans font-semibold tracking-wide border-b border-navy-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3">
              <p className="text-xs text-gold-500 uppercase tracking-widest font-bold mb-3">Situations</p>
              {situationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2.5 pl-3 text-silver-300 hover:text-gold-400 font-sans transition-colors border-b border-navy-800/50"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-5 space-y-3">
              <Link
                href="/contact"
                className="block w-full text-center bg-gold-500 hover:bg-gold-400 text-white font-bold py-4 tracking-wide transition-colors uppercase text-sm"
                onClick={() => setMenuOpen(false)}
              >
                See What Path Makes Sense
              </Link>
              <a
                href="tel:+16098004303"
                className="flex items-center justify-center gap-2 w-full border border-silver-300/40 text-silver-300 hover:text-white hover:border-white py-4 font-bold tracking-wide transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call (609) 800-4303
              </a>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
