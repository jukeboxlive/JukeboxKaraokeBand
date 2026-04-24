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

  // 0 → kırmızı (0°), 10 → yeşil (120°). Ortada amber/sarı geçişi.
  const score = settings?.currentScore;
  const scoreNum = typeof score === "number" ? score : parseFloat(score);
  const hasScore = Number.isFinite(scoreNum);
  const scoreHue = hasScore ? Math.max(0, Math.min(10, scoreNum)) * 12 : 0;
  const scoreStyle = hasScore
    ? {
        color: `hsl(${scoreHue}, 70%, 32%)`,
        textShadow: `0 0 14px hsla(${scoreHue}, 70%, 40%, 0.3), 0 0 32px hsla(${scoreHue}, 70%, 40%, 0.18)`,
      }
    : {};

  return (
    <div
      className="tv-screen"
      style={{ flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start", padding: 0 }}
    >
      {showConfetti && <Confetti />}
      <div className="ambient-glow ambient-glow--cyan" />
      <div className="ambient-glow ambient-glow--magenta" />

      {/* Irish Luck — tv-screen'e absolute, her zaman sağ üstte sabit */}
      <div style={{ position: "absolute", top: 28, right: 40, zIndex: 20 }}>
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

      {/*
        ── Header bloğu ──
        marginTop: -130 → tüm blok (logo + altındaki içerik) 130px yukarı kayar.
        Logo top: 0 → header'ın başından itibaren, yani ekran tepesinden ~130px yukarda başlar.
        Transparan PNG üst kısmı viewport dışında kalır (screen-blend = görünmez).
        Efektif in-flow yükseklik: 380 - 130 = 250px → içerik 258px'ten başlar.
      */}
      <div
        className="relative z-20 w-full flex-shrink-0"
        style={{ height: 380, marginTop: -130 }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(500px, 46vw)",
            height: "min(500px, 46vw)",
          }}
        >
          <Image
            src="/logo-jb.png"
            alt="Jukebox Live"
            fill
            priority
            className="object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      </div>

      {/* ── Ana içerik — header'ın altından biraz boşlukla başlar ── */}
      <div
        className="relative z-10 flex-1 flex items-center justify-center w-full text-center"
        style={{ paddingBottom: "2rem" }}
      >
        <div className="w-full max-w-5xl px-8">

          {/* ── IDLE ── */}
          {phase === "idle" && (
            <div>
              <p
                className="font-display text-7xl uppercase mb-4"
                style={{ color: "#14242e" }}
              >
                Sahne Seni Bekliyor
              </p>
              <p
                className="font-label mb-10 tracking-widest"
                style={{ fontSize: "2.25rem", color: "#14242e" }}
              >
                Masandaki QR kodu okut, sıraya gir
              </p>

              {waitingQueue.length > 0 && (
                <div>
                  <div className="divider-ornament mb-6 max-w-xl mx-auto">
                    <span className="font-label text-jukebox-red-dark text-xl">
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
                className="font-display uppercase text-cream-900 leading-none mb-5"
                style={{ fontSize: "clamp(4rem, 10vw, 8rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              <p
                className="font-display uppercase text-jukebox-red-dark"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              >
                {settings?.currentSongTitle}
              </p>
              {settings?.currentSongArtist && (
                <p className="font-serif italic text-cream-700 text-3xl mt-2">
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
                <p className="font-label text-jukebox-red-dark text-3xl">
                  Şimdi Oylayın
                </p>
              </div>
              <p
                className="font-display uppercase text-cream-900 mb-4"
                style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              <p className="font-serif italic text-cream-700 text-3xl mb-10">
                {settings?.currentSongTitle}
              </p>
              <div className="flex gap-3 justify-center flex-nowrap w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div
                    key={n}
                    className="tv-vote-number"
                    style={{
                      width: "clamp(3rem, 7vw, 5.5rem)",
                      height: "clamp(3rem, 7vw, 5.5rem)",
                      fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
                      flexShrink: 0,
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
              <p className="font-label text-jukebox-red-dark text-2xl mb-4 tracking-widest">
                Oylama Sona Erdi
              </p>
              <p
                className="font-display uppercase text-cream-900 mb-6"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
              >
                {settings?.currentApplicantName}
              </p>
              {scoreVisible && (
                <div className="score-pop">
                  <span
                    className="font-display neon-text-gold"
                    style={{
                      fontSize: "clamp(8rem, 22vw, 16rem)",
                      lineHeight: 1,
                      ...scoreStyle,
                    }}
                  >
                    {settings?.currentScore}
                  </span>
                  <span className="font-display text-cream-700 text-5xl ml-4">
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
                <p className="font-label text-jukebox-red-dark text-3xl">
                  ★ Gecenin Kazananı ★
                </p>
              </div>
              <p
                className="font-display uppercase text-cream-900 mb-6 winner-glow"
                style={{ fontSize: "clamp(4rem, 10vw, 8rem)", lineHeight: 1.05 }}
              >
                {settings?.currentApplicantName}
              </p>
              {scoreVisible && (
                <div className="score-pop">
                  <span
                    className="font-display neon-text-gold"
                    style={{
                      fontSize: "clamp(8rem, 22vw, 16rem)",
                      lineHeight: 1,
                      ...scoreStyle,
                    }}
                  >
                    {settings?.currentScore}
                  </span>
                  <span className="font-display text-cream-700 text-5xl ml-4">
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
