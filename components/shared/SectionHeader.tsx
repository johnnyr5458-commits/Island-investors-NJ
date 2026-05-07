import { twMerge } from "tailwind-merge";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
  id?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  centered = true,
  light = false,
  className,
  id,
}: SectionHeaderProps) {
  return (
    <div
      className={twMerge(
        "max-w-3xl",
        centered ? "mx-auto text-center" : "",
        className
      )}
    >
      {eyebrow && (
        <p
          className={`font-sans text-xs font-bold uppercase tracking-widest mb-4 ${
            light ? "text-gold-300" : "text-gold-500"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 ${
          light ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-lg leading-relaxed ${
            light ? "text-silver-300" : "text-gray-600"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
