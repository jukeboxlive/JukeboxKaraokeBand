"use client";
import { useMemo, useEffect, useRef } from "react";

// Jukebox palette — cream, brass, jukebox red, chrome
const COLORS = ["#e9d7a5", "#f4c869", "#d4a94b", "#c4302a", "#e04a42", "#cbcdd2"];

export default function Confetti() {
  const containerRef = useRef(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [],
  );

  // Animasyon bittikten sonra DOM'dan temizle
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      if (el) el.innerHTML = "";
    }, 5000); // 3s animasyon + 2s gecikme max
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
          }}
        />
      ))}
    </div>
  );
}
