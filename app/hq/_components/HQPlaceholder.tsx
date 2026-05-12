import { HQ_TEXT } from "@/lib/hq-colors";

export default function HQPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-sm mb-8" style={{ color: "rgba(220, 175, 68, 0.92)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
        Coming Soon
      </div>
      <h1 className="font-display text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="font-sans text-base max-w-md mx-auto leading-relaxed" style={{ color: HQ_TEXT.secondary }}>
        {description}
      </p>
      <p className="font-sans text-sm mt-6" style={{ color: HQ_TEXT.helper }}>
        Internal tools coming soon. This area is not publicly accessible.
      </p>
    </div>
  );
}
