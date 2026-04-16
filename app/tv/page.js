"use client";
import Image from "next/image";
import { useSettings, useQueue } from "@/lib/hooks";
import { useEffect, useState } from "react";
import Confetti from "@/components/Confetti";

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
        const t2 = setTimeout(() => setShowConfetti(false), 5000);
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
    <div
      className="tv-screen"
      style={{ flexDirection: "column", alignItems: "stretch", padding: 0 }}
    >
      {showConfetti && <Confetti />}
      <div className="ambient-glow ambient-glow--cyan" />
      <div className="ambient-glow ambient-glow--magenta" />

      {/*
        ── Header bloğu ──
        In-flow (flex-col içinde yer kaplıyor) → içerik asla üste binmez.
        İçindeki logolar absolute, birbirinin aynı top hizasında.
        Yüksekliği: 28px (top-7 offset) + min(450px, 40vh) (JB-02) = min(478px, ~43vh)
      */}
      <div
        className="relative z-20 w-full flex-shrink-0"
        style={{ height: "calc(28px + min(450px, 40vh))" }}
      >
        {/* JB-02 — üst merkez, Irish Luck ile aynı top */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(1100px, 95vw)",
            height: "min(450px, 40vh)",
          }}
        >
          <Image
            src="/logo-jb.png"
            alt="Jukebox Live"
            fill
            className="object-contain"
            priority
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Irish Luck — eski yeri: sağ üst köşe */}
        <div style={{ position: "absolute", top: 28, right: 40 }}>
          <Image
            src="/logo-venue.png"
            alt="Irish Luck Pub & Restaurant"
            width={110}
            height={110}
            priority
            className="object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      </div>

      {/* ── Ana içerik — kalan alanda dikey ortalı ── */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center w-full text-center"
        style={{ paddingBottom: "2rem" }}
      >
        <div className="w-full max-w-5xl px-8">

          {/* ── IDLE ── */}
          {phase === "idle" && (
            <div>
              <p className="font-display text-7xl uppercase text-cream mb-4">
                Sahne Seni Bekliyor
              </p>
              <p
                className="font-label text-cream-300/80 mb-10 tracking-widest"
                style={{ fontSize: "2.25rem" }}
              >
                Masandaki QR kodu okut, sıraya gir
              </p>

              {waitingQueue.length > 0 && (
                <div>
                  <div className="divider-ornament mb-6 max-w-xl mx-auto">
                    <span className="font-label text-brass-light text-xl">
                      ★ Sıradakiler ★
                    </span>
                  </div>
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {waitingQueue.slice(0, 5).map((a, i) => (
                      <div
                        key={a.id}
                        className="paper-card px-8 py-4 flex items-center gap-5"
                      >
                        <span className="font-display text-4xl text-jukebox-red w-14 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="text-left min-w-0">
                          <p className="font-display text-2xl uppercase text-cream-900 truncate">
                            {a.name}
                          </p>
                          <p className="font-serif italic text-cream-700 text-xl truncate">
                            {a.songTitle}
                          </p>
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
              <div
                style={{ position: "relative", width: 230, height: 230, margin: "0 auto 1.5rem" }}
              >
                <div className="vinyl-spin" style={{ position: "absolute", inset: 0 }}>
                  <Image
                    src="/logo-vinyl-dark.png"
                    alt=""
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <p
                className="font-display uppercase text-cream leading-none mb-5"
                style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              <p
                className="font-display uppercase text-jukebox-red-light"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                {settings?.currentSongTitle}
              </p>
              {settings?.currentSongArtist && (
                <p className="font-serif italic text-cream-300 text-3xl mt-2">
                  {settings.currentSongArtist}
                </p>
              )}

              {nextPerson && (
                <div className="mt-10 paper-card inline-block px-10 py-4">
                  <p className="jukebox-meta text-sm">Sıradaki</p>
                  <p className="font-display text-2xl uppercase text-cream-900 mt-1">
                    {nextPerson.name}{" "}
                    <span className="font-serif italic text-cream-700 text-xl ml-2">
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
              <div className="jukebox-strip py-3 max-w-2xl mx-auto mb-6">
                <p className="font-label text-brass-light text-3xl">
                  Şimdi Oylayın
                </p>
              </div>
              <p
                className="font-display uppercase text-cream mb-4"
                style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              <p className="font-serif italic text-cream-300 text-3xl mb-10">
                {settings?.currentSongTitle}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div
                    key={n}
                    className="tv-vote-number"
                    style={{
                      width: "5.5rem",
                      height: "5.5rem",
                      fontSize: "2rem",
                      animationDuration: `${1 + n * 0.1}s`,
                    }}
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
              <p className="font-label text-brass-light text-2xl mb-4 tracking-widest">
                Oylama Sona Erdi
              </p>
              <p
                className="font-display uppercase text-cream mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              {scoreVisible && (
                <div className="score-pop">
                  <span
                    className="font-display neon-text-gold"
                    style={{ fontSize: "clamp(8rem, 22vw, 16rem)", lineHeight: 1 }}
                  >
                    {settings?.currentScore}
                  </span>
                  <span className="font-display text-cream-300 text-5xl ml-4">
                    / 10
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── SHOWING WINNER ── */}
          {phase === "showing-winner" && (
            <div>
              <div className="jukebox-strip py-3 max-w-2xl mx-auto mb-6">
                <p className="font-label text-brass-light text-3xl">
                  ★ Gecenin Kazananı ★
                </p>
              </div>
              <p
                className="font-display uppercase text-cream mb-6 winner-glow"
                style={{ fontSize: "clamp(4rem, 10vw, 8rem)", lineHeight: 1.05 }}
              >
                {settings?.currentApplicantName}
              </p>
              {scoreVisible && (
                <div className="score-pop">
                  <span
                    className="font-display neon-text-gold"
                    style={{ fontSize: "clamp(8rem, 22vw, 16rem)", lineHeight: 1 }}
                  >
                    {settings?.currentScore}
                  </span>
                  <span className="font-display text-cream-300 text-5xl ml-4">
                    / 10
                  </span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
