"use client";
import Image from "next/image";

/**
 * Jukebox Live logo.
 * variant: "circle" (Logo 1) | "square" (Logo 2)
 * size: px (rendered square)
 */
export default function Logo({ variant = "circle", size = 120, className = "", priority = false }) {
  const src = variant === "square" ? "/logo-square.png" : "/logo-circle.png";
  return (
    <Image
      src={src}
      alt="Jukebox Live Karaoke Band"
      width={size}
      height={size}
      priority={priority}
      className={`select-none ${className}`}
    />
  );
}
