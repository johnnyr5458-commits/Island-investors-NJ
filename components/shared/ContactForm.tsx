"use client";

import { useForm, ValidationError } from "@formspree/react";
import TrustBlock from "./TrustBlock";

export default function ContactForm({ dark = false }: { dark?: boolean }) {
  const [state, handleSubmit] = useForm("mpqbjlob");

  const inputClass = `w-full px-4 py-3 rounded-sm text-sm font-sans border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500 ${
    dark
      ? "bg-navy-800 border-navy-700 text-white placeholder:text-silver-400 focus:border-gold-500"
      : "bg-white border-silver-100 text-charcoal placeholder:text-gray-400 focus:border-gold-500"
  }`;

  if (state.succeeded) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className={`font-display text-2xl font-bold mb-2 ${dark ? "text-white" : "text-navy-900"}`}>
          We received your request!
        </h3>
        <p className={dark ? "text-silver-300" : "text-gray-600"}>
          Someone from our team will reach out within 24 hours to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-silver-300" : "text-gray-600"}`}>
          Property Address
        </label>
        <input
          type="text"
          name="address"
          required
          placeholder="123 Main St, Atlantic City, NJ"
          className={inputClass}
        />
        <ValidationError field="address" errors={state.errors} className="text-red-400 text-xs mt-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-silver-300" : "text-gray-600"}`}>
            Your Name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="John Smith"
            className={inputClass}
          />
          <ValidationError field="name" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-silver-300" : "text-gray-600"}`}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            required
            placeholder="(609) 800-4303"
            className={inputClass}
          />
          <ValidationError field="phone" errors={state.errors} className="text-red-400 text-xs mt-1" />
        </div>
      </div>

      <div>
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-silver-300" : "text-gray-600"}`}>
          Best Time to Call
        </label>
        <select name="bestTime" className={inputClass}>
          <option value="">Select a time</option>
          <option value="morning">Morning (8am–12pm)</option>
          <option value="afternoon">Afternoon (12pm–5pm)</option>
          <option value="evening">Evening (5pm–8pm)</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>

      <div>
        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-silver-300" : "text-gray-600"}`}>
          Tell Us About Your Situation (Optional)
        </label>
        <textarea
          name="message"
          rows={3}
          placeholder="Inherited property, behind on payments, need to relocate..."
          className={inputClass}
        />
        <ValidationError field="message" errors={state.errors} className="text-red-400 text-xs mt-1" />
      </div>

      <ValidationError errors={state.errors} className="text-red-400 text-sm" />

      <button
        type="submit"
        disabled={state.submitting}
        className="w-full bg-gold-500 hover:bg-gold-400 text-white font-sans font-bold text-base py-4 px-6 rounded-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {state.submitting ? "Sending..." : "Request a Conversation →"}
      </button>

      <p className={`text-center text-xs ${dark ? "text-silver-400" : "text-gray-500"}`}>
        No obligation. No fees. We respond within 24 hours.
      </p>

      <TrustBlock dark={dark} />
    </form>
  );
}
