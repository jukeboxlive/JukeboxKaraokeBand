"use client";
import Image from "next/image";
import { useSettings, useQueue } from "@/lib/hooks";
import { useEffect, useState } from "react";
import Confetti from "@/components/Confetti";
import Logo from "@/components/Logo";

function InstagramIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export default function TVPage() {
  const settings = useSettings();
  const queue = useQueue();
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);

  useEffect(() => {
    if (settings?.phase === "showing-score" || settings?.phase === "showing-winner") {
      const t1 = setTimeout(() => setScoreVisible(true), 500);
      if (settings?.phase === "showing-winner") {
        setShowConfetti(true);
        const t2 = setTimeout(() => setShowConfetti(false), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
      }
      return () => clearTimeout(t1);
    } else {
      setShowConfetti(false);
      setScoreVisible(false);
    }
  }, [settings?.phase]);

  const phase = settings?.phase || "idle";
  const waitingQueue = queue.filter((a) => a.status === "waiting");
  const nextPerson = waitingQueue[0];

  return (
    <div className="tv-screen">
      {showConfetti && <Confetti />}

      {/* Ambient glow */}
      <div className="ambient-glow ambient-glow--cyan" />
      <div className="ambient-glow ambient-glow--magenta" />

      {/* ── Jukebox logo — top-left corner ── */}
      <div className="absolute top-7 left-10 z-20 flex flex-col items-center gap-2">
        <Logo variant="circle" size={100} priority />
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-label text-brass-light hover:text-brass transition-colors"
          style={{ fontSize: "0.78rem", letterSpacing: "0.16em" }}
        >
          <InstagramIcon /> @JUKEBOXLIVE
        </a>
      </div>

      {/* ── Irish Luck logo — top-right corner ── */}
      <div className="absolute top-7 right-10 z-20 flex flex-col items-center gap-2">
        <Image
          src="/logo-venue.png"
          alt="Irish Luck Pub & Restaurant"
          width={100}
          height={100}
          priority
          className="object-contain"
          style={{ mixBlendMode: "screen" }}
        />
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-label text-brass-light hover:text-brass transition-colors"
          style={{ fontSize: "0.78rem", letterSpacing: "0.16em" }}
        >
          <InstagramIcon /> @IRISHLUCK_PUB
        </a>
      </div>

      {/* ── Centre content ── */}
      <div className="relative z-10 w-full max-w-4xl">

        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div>
            <p className="font-display text-5xl uppercase text-cream mb-3">
              Sahne Seni Bekliyor
            </p>
            <p className="font-label text-cream-300/70 text-xl mb-8 tracking-widest">
              Masandaki QR kodu okut, sıraya gir
            </p>

            {waitingQueue.length > 0 && (
              <div>
                <div className="divider-ornament mb-5 max-w-md mx-auto">
                  <span className="font-label text-brass-light text-sm">
                    ★ Sıradakiler ★
                  </span>
                </div>
                <div className="space-y-3 max-w-lg mx-auto">
                  {waitingQueue.slice(0, 6).map((a, i) => (
                    <div
                      key={a.id}
                      className="paper-card px-6 py-3 flex items-center gap-4"
                    >
                      <span className="font-display text-3xl text-jukebox-red w-10 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="text-left min-w-0">
                        <p className="song-card__title truncate">{a.name}</p>
                        <p className="song-card__artist truncate">{a.songTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PERFORMING ── */}
        {phase === "performing" && (
          <div>
            <div className="performer-avatar">
              <span className="text-cream-100">🎤</span>
            </div>
            <p className="font-label text-brass-light text-base mb-3">
              Şu An Sahnede
            </p>
            <p className="font-display text-7xl uppercase text-cream mb-4 leading-none">
              {settings?.currentApplicantName}
            </p>
            <p className="font-display text-3xl uppercase text-jukebox-red-light">
              {settings?.currentSongTitle}
            </p>
            {settings?.currentSongArtist && (
              <p className="font-serif italic text-cream-300 text-2xl mt-1">
                {settings.currentSongArtist}
              </p>
            )}

            {nextPerson && (
              <div className="mt-12 paper-card inline-block px-8 py-3">
                <p className="jukebox-meta">Sıradaki</p>
                <p className="song-card__title mt-1">
                  {nextPerson.name}{" "}
                  <span className="song-card__artist ml-2">
                    — {nextPerson.songTitle}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VOTING ── */}
        {phase === "voting" && (
          <div>
            <div className="jukebox-strip py-2 max-w-xl mx-auto mb-4">
              <p className="font-label text-brass-light text-lg">
                Şimdi Oylayın
              </p>
            </div>
            <p className="font-display text-6xl uppercase text-cream mb-4">
              {settings?.currentApplicantName}
            </p>
            <p className="font-serif italic text-cream-300 text-2xl">
              {settings?.currentSongTitle}
            </p>
            <div className="flex gap-3 justify-center mt-10 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className="tv-vote-number"
                  style={{ animationDuration: `${1 + n * 0.1}s` }}
                >
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHOWING SCORE ── */}
        {phase === "showing-score" && (
          <div>
            <p className="font-label text-brass-light text-base mb-3">
              Oylama Sona Erdi
            </p>
            <p className="font-display text-5xl uppercase text-cream mb-6">
              {settings?.currentApplicantName}
            </p>
            {scoreVisible && (
              <div className="score-pop">
                <span className="font-display text-[160px] leading-none neon-text-gold">
                  {settings?.currentScore}
                </span>
                <span className="font-display text-4xl text-cream-300 ml-3">
                  / 10
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── SHOWING WINNER ── */}
        {phase === "showing-winner" && (
          <div>
            <div className="jukebox-strip py-2 max-w-xl mx-auto mb-4">
              <p className="font-label text-brass-light text-lg">
                ★ Gecenin Kazananı ★
              </p>
            </div>
            <p className="font-display text-7xl uppercase text-cream mb-6 winner-glow">
              {settings?.currentApplicantName}
            </p>
            {scoreVisible && (
              <div className="score-pop">
                <span className="font-display text-[160px] leading-none neon-text-gold">
                  {settings?.currentScore}
                </span>
                <span className="font-display text-4xl text-cream-300 ml-3">
                  / 10
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
