"use client";
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

      {/* Logo */}
      <h1 className="tv-logo">KARAOKE LIVE</h1>

      <div className="relative z-10 w-full max-w-3xl">
        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div>
            <p className="font-display text-3xl font-bold text-white mb-2">
              Sahne Seni Bekliyor!
            </p>
            <p className="text-gray-400 text-lg mb-6">
              Masandaki QR kodu okutarak sıraya gir
            </p>

            {waitingQueue.length > 0 && (
              <div>
                <p className="font-display text-xl font-semibold neon-text-cyan mb-4">
                  Sıradakiler
                </p>
                <div className="space-y-3 max-w-lg mx-auto">
                  {waitingQueue.map((a, i) => (
                    <div key={a.id} className="glass rounded-xl px-6 py-4 flex items-center gap-4">
                      <span className="font-display text-2xl font-bold neon-text-magenta w-8">
                        {i + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-semibold text-white text-lg">{a.name}</p>
                        <p className="text-sm text-gray-400">{a.songTitle}</p>
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
            <div className="performer-avatar">🎤</div>
            <p className="text-gray-400 uppercase tracking-[0.3em] text-sm mb-3">
              Sahnede
            </p>
            <p className="font-display text-6xl font-extrabold text-white mb-3">
              {settings?.currentApplicantName}
            </p>
            <p className="text-2xl neon-text-cyan font-display font-semibold">
              {settings?.currentSongTitle}
            </p>
            {settings?.currentSongArtist && (
              <p className="text-lg text-gray-400 mt-1">
                {settings.currentSongArtist}
              </p>
            )}

            {nextPerson && (
              <div className="mt-12 glass rounded-xl px-8 py-4 inline-block">
                <p className="text-sm text-gray-400">Sıradaki</p>
                <p className="font-display text-xl font-semibold text-white">
                  {nextPerson.name} – {nextPerson.songTitle}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VOTING ── */}
        {phase === "voting" && (
          <div>
            <p className="font-display text-5xl font-extrabold text-white mb-4">
              ŞİMDİ OYLAYIN!
            </p>
            <p className="text-xl text-gray-400 mb-2">
              <span className="neon-text-cyan font-semibold">
                {settings?.currentApplicantName}
              </span>{" "}
              için puan verin
            </p>
            <p className="text-lg text-gray-500">
              {settings?.currentSongTitle}
            </p>
            <div className="flex gap-2 justify-center mt-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className="tv-vote-number"
                  style={{ animationDuration: `${1 + n * 0.1}s` }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHOWING SCORE ── */}
        {phase === "showing-score" && (
          <div>
            <p className="font-display text-4xl font-extrabold text-white mb-6">
              {settings?.currentApplicantName}
            </p>
            {scoreVisible && (
              <div className="score-pop">
                <p className="text-gray-300 uppercase tracking-widest text-sm mb-2">
                  Puan
                </p>
                <span className="font-display text-[120px] leading-none font-black neon-text-gold">
                  {settings?.currentScore}
                </span>
                <span className="font-display text-3xl text-gray-400 font-bold ml-2">
                  / 10
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── SHOWING WINNER ── */}
        {phase === "showing-winner" && (
          <div>
            <p className="text-gray-300 uppercase tracking-[0.3em] text-lg mb-4">
              Gecenin Kazananı
            </p>
            <p className="font-display text-6xl font-extrabold text-white mb-6 winner-glow">
              {settings?.currentApplicantName}
            </p>
            {scoreVisible && (
              <div className="score-pop">
                <p className="text-gray-300 uppercase tracking-widest text-sm mb-2">
                  Puan
                </p>
                <span className="font-display text-[120px] leading-none font-black neon-text-gold">
                  {settings?.currentScore}
                </span>
                <span className="font-display text-3xl text-gray-400 font-bold ml-2">
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
