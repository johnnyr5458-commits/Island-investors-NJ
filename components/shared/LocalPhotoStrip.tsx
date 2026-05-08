import Image from "next/image";

interface LocalPhotoStripProps {
  src: string;
  alt: string;
  eyebrow: string;
  heading: string;
  height?: string;
  position?: string;
}

export default function LocalPhotoStrip({
  src,
  alt,
  eyebrow,
  heading,
  height = "h-52 md:h-64",
  position = "object-center",
}: LocalPhotoStripProps) {
  return (
    <div className={`relative overflow-hidden ${height}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${position}`}
        sizes="(max-width: 768px) 100vw, 1400px"
        loading="lazy"
      />
      {/* Solid base — lightened so the photo breathes */}
      <div className="absolute inset-0 bg-navy-950/48" />
      {/* Directional gradients concentrate darkness at text area */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/32 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/38 via-transparent to-transparent" />
      <div className="absolute inset-0 flex items-center px-8 md:px-12">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-gold-400 mb-2">
            {eyebrow}
          </p>
          <p className="font-display text-xl md:text-2xl font-semibold text-white leading-snug max-w-md">
            {heading}
          </p>
        </div>
      </div>
    </div>
  );
}
