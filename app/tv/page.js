"use client";
import { useSettings, useQueue } from "@/lib/hooks";
import { useEffect, useState } from "react";
import Confetti from "@/components/Confetti";
import BrandHeader from "@/components/BrandHeader";

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

      {/* Logos */}
      <BrandHeader size={170} gap="gap-16" className="relative z-10 mb-10" priority />

      <div className="relative z-10 w-full max-w-4xl">
        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div>
            <p className="font-display text-5xl uppercase text-cream mb-3">
              Sahne Seni Bekliyor
            </p>
            <p className="jukebox-artist text-cream-300 text-xl mb-8">
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
                        <p className="song-card__artist truncate">
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
              <p className="jukebox-artist text-cream-300 text-xl mt-1">
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
            <p className="jukebox-artist text-2xl text-cream-300">
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
              Puan Verildi
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
