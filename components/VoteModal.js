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
      <div className="glass rounded-3xl p-6 w-full max-w-md space-y-5">
        {isDone ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-display text-xl font-bold text-white">
              {voteSubmitted ? "Oyunuz Kaydedildi!" : "Zaten Oy Kullandınız"}
            </p>
            {voteScore && (
              <p className="neon-text-gold text-lg mt-2">{voteScore} / 10</p>
            )}
            <button onClick={handleClose} className="btn-secondary mt-4">
              Kapat
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Anonim Oylama
              </p>
              <p className="font-display text-xl font-bold text-white mt-1">
                {settings?.currentApplicantName}
              </p>
              <p className="text-gray-400 text-sm">
                {settings?.currentSongTitle}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
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
                  {n}
                </button>
              ))}
            </div>

            {voteScore && (
              <p className="text-center">
                <span className="font-display text-3xl font-extrabold neon-text-gold">
                  {voteScore}
                </span>
                <span className="text-gray-400"> / 10</span>
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={handleClose} className="btn-secondary flex-1">
                İptal
              </button>
              <button
                onClick={handleVote}
                disabled={!voteScore || submitting}
                className={`flex-1 py-3 rounded-xl font-display font-bold transition-all ${
                  voteScore && !submitting ? "btn-vote" : "btn-disabled"
                }`}
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
