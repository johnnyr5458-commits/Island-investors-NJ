"use client";

export default function PhoneButton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      {/* Gold top border line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="flex">
        <a
          href="tel:+16098004303"
          className="flex-1 bg-navy-900 text-white font-sans font-bold text-sm py-4 text-center tracking-wide flex items-center justify-center gap-2 hover:bg-navy-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          (609) 800-4303
        </a>
        <a
          href="/contact"
          className="flex-1 bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-sm py-4 text-center tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          See My Options
        </a>
      </div>
    </div>
  );
}
