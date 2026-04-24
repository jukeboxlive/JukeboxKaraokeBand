"use client";
import Image from "next/image";

/**
 * Jukebox Live logo.
 * variant: "circle" (Logo 1) | "square" (Logo 2)
 * size: px (rendered square)
 */
export default function Logo({ variant = "circle", size = 120, className = "", priority = false }) {
  const src =
    variant === "square"
      ? "/logo-square.png"
      : variant === "jb"
        ? "/logo-jb-06.png"
        : "/logo-jb-06.png";
  // New JB-06 logo is already transparent-bordered; only square variant needs no blend.
  // Legacy vinyl-gold assets used mixBlendMode: "screen" — JB-06 does not.
  const needsScreen = false;

  return (
    <Image
      src={src}
      alt="Jukebox Live Karaoke Band"
      width={size}
      height={size}
      priority={priority}
      className={`select-none ${className}`}
      style={needsScreen ? { mixBlendMode: "screen" } : undefined}
    />
  );
}
