"use client";
import { useState, useEffect } from "react";
import { useSettings, useDeviceId } from "@/lib/hooks";
import { useStore } from "@/lib/store";

export default function VoteModal({ visible, onClose }) {
  const settings = useSettings();
  const deviceId = useDeviceId();
  const { actions } = useStore();

  const [voteScore, setVoteScore] = useState(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset when performance changes
  useEffect(() => {
    setVoteSubmitted(false);
    setAlreadyVoted(false);
    setVoteScore(null);
    setSubmitting(false);
  }, [settings?.phase, settings?.currentApplicantId]);

  // Check if already voted when opening (async)
  useEffect(() => {
    if (visible && settings?.currentApplicantId && deviceId) {
      actions.hasVoted(settings.currentApplicantId, deviceId).then((voted) => {
        if (voted) setAlreadyVoted(true);
      });
    }
  }, [visible, settings?.currentApplicantId, deviceId, actions]);

  if (!visible) return null;

  const handleVote = async () => {
    if (!voteScore || !settings?.currentApplicantId || submitting) return;
    setSubmitting(true);
    try {
      await actions.submitVote(settings.currentApplicantId, deviceId, voteScore);
      setVoteSubmitted(true);
    } catch (err) {
      if (err.message?.includes("zaten")) setAlreadyVoted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setVoteScore(null);
    onClose();
  };

  const isDone = alreadyVoted || voteSubmitted;

  return (
    <div className="modal-overlay">
      <div className="glass p-6 w-full max-w-md space-y-5 rounded-3xl">
        {isDone ? (
          <div className="text-center py-4">
            <p className="text-5xl mb-3">★</p>
            <p className="font-display text-2xl uppercase text-cream">
              {voteSubmitted ? "Oyun Kaydedildi" : "Zaten Oy Kullandın"}
            </p>
            {voteScore && (
              <p className="neon-text-gold text-2xl mt-2 font-display">
                {voteScore} / 10
              </p>
            )}
            <button onClick={handleClose} className="btn-secondary mt-5">
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="font-label text-cream-300 text-xs">
                Anonim Oylama
              </p>
              <p className="font-display text-2xl uppercase text-cream mt-2">
                {settings?.currentApplicantName}
              </p>
              <p className="jukebox-artist text-cream-300">
                {settings?.currentSongTitle}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setVoteScore(n)}
                  className={`vote-number ${
                    voteScore === n
                      ? "vote-number--selected"
                      : voteScore && n <= voteScore
                        ? "vote-number--in-range"
                        : "vote-number--default"
                  }`}
                >
                  <span>{n}</span>
                </button>
              ))}
            </div>

            {voteScore && (
              <p className="text-center">
                <span className="font-display text-4xl neon-text-gold">
                  {voteScore}
                </span>
                <span className="text-cream-300 font-serif italic"> / 10</span>
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={handleClose} className="btn-secondary flex-1">
                İptal
              </button>
              <button
                onClick={handleVote}
                disabled={!voteScore || submitting}
                className={`flex-1 ${voteScore && !submitting ? "btn-vote" : "btn-disabled"}`}
              >
                {submitting ? "Gönderiliyor..." : "Oyla!"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
