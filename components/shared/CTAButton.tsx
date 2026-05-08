"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { trackCTAClick } from "@/lib/analytics";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "outline" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
  trackingLabel?: string;
}

const base =
  "inline-flex items-center justify-center font-sans font-bold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2";

const variants = {
  gold: "bg-gold-500 text-white hover:bg-gold-400 shadow-lg hover:shadow-gold-500/30 hover:-translate-y-0.5",
  outline:
    "border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white hover:-translate-y-0.5",
  white:
    "bg-white text-navy-900 hover:bg-cream-50 shadow-md hover:-translate-y-0.5",
};

const sizes = {
  sm: "px-5 py-2.5 text-sm rounded-sm",
  md: "px-7 py-3.5 text-base rounded-sm",
  lg: "px-9 py-4.5 text-lg rounded-sm",
};

export default function CTAButton({
  href,
  children,
  variant = "gold",
  size = "md",
  className,
  external,
  trackingLabel,
}: CTAButtonProps) {
  const classes = twMerge(base, variants[variant], sizes[size], className);
  const handleClick = () => { if (trackingLabel) trackCTAClick(trackingLabel); };

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={handleClick}>
      {children}
    </Link>
  );
}
