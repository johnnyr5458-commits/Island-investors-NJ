export default function TrustBlock({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`p-5 border flex items-start gap-4 ${
        dark
          ? "border-gold-500/25 bg-navy-900/50"
          : "border-gold-500/30 bg-cream-50"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        <svg
          className={`w-5 h-5 ${dark ? "text-gold-400" : "text-gold-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"
          />
        </svg>
      </div>
      <div>
        <p
          className={`font-display text-sm font-semibold mb-1.5 ${
            dark ? "text-silver-100" : "text-navy-900"
          }`}
        >
          Every Conversation Stays Private
        </p>
        <p
          className={`text-xs leading-relaxed ${
            dark ? "text-silver-400" : "text-gray-600"
          }`}
        >
          We respect the privacy of every conversation. Information shared with
          Island Investors stays confidential and is never shared without
          permission.
        </p>
        <p
          className={`text-xs leading-relaxed mt-1.5 ${
            dark ? "text-silver-400" : "text-gray-600"
          }`}
        >
          Every inquiry is reviewed personally — never handed off to automated
          systems or mass contact lists.
        </p>
      </div>
    </div>
  );
}
