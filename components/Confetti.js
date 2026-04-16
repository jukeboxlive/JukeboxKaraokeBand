"use client";
import { useMemo, useEffect, useRef } from "react";

// Jukebox palette — cream, brass, jukebox red, chrome
const COLORS = ["#e9d7a5", "#f4c869", "#d4a94b", "#c4302a", "#e04a42", "#cbcdd2"];

export default function Confetti() {
  const containerRef = useRef(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 55 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        // Delay 0-3s so particles keep appearing throughout the 5s window
        delay: Math.random() * 3,
        // Duration 3.5-5s so they stay visible longer
        duration: 3.5 + Math.random() * 1.5,
        size: 7 + Math.random() * 9,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [],
  );

  // Clean up DOM after all animations finish (5s effect + max 3s delay + some buffer)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      if (el) el.innerHTML = "";
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
