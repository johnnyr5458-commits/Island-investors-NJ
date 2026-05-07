"use client";

import { useForm, ValidationError } from "@formspree/react";
import TrustBlock from "@/components/shared/TrustBlock";

export default function PartnerForm() {
  const [state, handleSubmit] = useForm("mpqbjlob");

  const inputClass = "w-full bg-navy-700 border border-navy-600 text-white placeholder-silver-400/50 px-4 py-3 text-sm font-sans focus:outline-none focus:border-gold-500/60 transition-colors";
  const labelClass = "block font-sans text-xs font-bold uppercase tracking-wider text-silver-400 mb-2";

  if (state.succeeded) {
    return (
      <div className="bg-navy-800 p-10 text-center">
        <div className="w-14 h-14 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-semibold text-white mb-3">We&apos;ll Be in Touch</h3>
        <p className="text-silver-400 text-sm leading-relaxed">
          Thanks for reaching out. We review every inquiry personally and will follow up within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-800 p-8 md:p-10 space-y-6 relative">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="p-name" className={labelClass}>Full Name *</label>
          <input id="p-name" name="name" type="text" required placeholder="Your name" className={inputClass} />
          <ValidationError field="name" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
        <div>
          <label htmlFor="p-company" className={labelClass}>Company / Business</label>
          <input id="p-company" name="company" type="text" placeholder="Optional" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="p-email" className={labelClass}>Email Address *</label>
          <input id="p-email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
          <ValidationError field="email" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
        <div>
          <label htmlFor="p-phone" className={labelClass}>Phone Number *</label>
          <input id="p-phone" name="phone" type="tel" required placeholder="(609) 000-0000" className={inputClass} />
          <ValidationError field="phone" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
      </div>

      <div>
        <label htmlFor="p-areas" className={labelClass}>Markets You Know Best</label>
        <input id="p-areas" name="areas" type="text" placeholder="e.g. Atlantic County, Cape May County, all of South Jersey" className={inputClass} />
      </div>

      <div>
        <label htmlFor="p-types" className={labelClass}>Types of Projects You Typically Take On</label>
        <input id="p-types" name="property_types" type="text" placeholder="e.g. Single-family, multi-unit, renovation projects" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="p-funding" className={labelClass}>What&apos;s Your Preferred Structure? *</label>
          <select id="p-funding" name="funding" required defaultValue="" className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select one</option>
            <option value="Cash">Cash</option>
            <option value="Conventional Financing">Conventional Financing</option>
            <option value="Hard Money">Hard Money</option>
            <option value="Private Lending">Private Lending</option>
            <option value="Creative Financing">Creative Financing</option>
            <option value="Hybrid / Situation Dependent">Hybrid / Situation Dependent</option>
          </select>
          <ValidationError field="funding" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
        <div>
          <label htmlFor="p-volume" className={labelClass}>Typical Project Volume</label>
          <select id="p-volume" name="volume" defaultValue="" className={inputClass + " appearance-none cursor-pointer"}>
            <option value="">Select one</option>
            <option value="1–5">1–5 properties</option>
            <option value="6–15">6–15 properties</option>
            <option value="16–30">16–30 properties</option>
            <option value="30+">30+ properties</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="p-notes" className={labelClass}>Tell Us About Your Approach</label>
        <textarea
          id="p-notes"
          name="notes"
          rows={4}
          placeholder="Share how you typically work, what kinds of projects interest you, or what matters most to you in a professional partnership."
          className={inputClass + " resize-none"}
        />
        <ValidationError field="notes" errors={state.errors} className="text-red-400 text-xs mt-1" />
      </div>

      <ValidationError errors={state.errors} className="text-red-400 text-sm" />

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-white font-sans font-bold py-4 tracking-wide uppercase text-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/20"
      >
        {state.submitting ? "Sending..." : "Send My Introduction →"}
      </button>

      <TrustBlock dark={true} />
    </form>
  );
}
