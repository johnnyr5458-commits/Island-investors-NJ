export default function HQPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-sm mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
        Coming Soon
      </div>
      <h1 className="font-display text-4xl font-bold text-white mb-4">{title}</h1>
      <p className="font-sans text-silver-400 text-base max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <p className="font-sans text-silver-600 text-sm mt-6">
        Internal tools coming soon. This area is not publicly accessible.
      </p>
    </div>
  );
}
