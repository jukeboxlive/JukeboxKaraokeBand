"use client";
import { useState, useEffect, useRef } from "react";
import { useSettings, useQueue, useAllQueue, useVoteCount, useClientUrl } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import QRCode from "@/components/QRCode";
import SongManager from "@/components/SongManager";

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [actionError, setActionError] = useState("");
  const settings = useSettings();
  const queue = useQueue();
  const allQueue = useAllQueue();
  const voteCount = useVoteCount();
  const { actions } = useStore();
  const joinUrl = useClientUrl("/join");

  // drag state
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("karaoke_admin") === "true")
      setIsAuthed(true);
  }, []);

  const handleLogin = async () => {
    setLoginError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthed(true);
        sessionStorage.setItem("karaoke_admin", "true");
      } else {
        setLoginError("Yanlış şifre!");
      }
    } catch {
      setLoginError("Bağlantı hatası. Tekrar deneyin.");
    }
  };

  const safeAction = async (fn) => {
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err.message || "Bir hata oluştu.");
      setTimeout(() => setActionError(""), 4000);
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm space-y-4">
          <h1 className="heading-primary neon-text-cyan text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Şifre"
            className="input-field"
          />
          {loginError && (
            <p className="text-red-400 text-sm text-center">{loginError}</p>
          )}
          <button onClick={handleLogin} className="btn-cyan w-full">
            Giriş
          </button>
        </div>
      </div>
    );
  }

  const phase = settings?.phase || "idle";
  const waitingQueue = queue.filter((a) => a.status === "waiting");
  const onStage = queue.find((a) => a.status === "on-stage");
  const nextUp = waitingQueue[0];

  const handleDragStart = (idx) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
  };

  const handleDragEnter = (idx) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    setDraggingIdx(null);

    if (from === null || to === null || from === to) return;

    const reordered = [...waitingQueue];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const orderedIds = reordered.map((a) => a.id);
    safeAction(() => actions.reorderQueue(orderedIds));

    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="min-h-screen bg-dark-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <h1 className="heading-primary neon-text-cyan">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                safeAction(async () => {
                  if (settings?.isLive) {
                    await actions.endStage();
                  } else {
                    await actions.createStage();
                  }
                })
              }
              className={`badge ${settings?.isLive ? "badge--live" : "badge--offline"}`}
            >
              {settings?.isLive ? "CANLI" : "KAPALI"}
            </button>
            <a href="/tv" target="_blank" className="btn-secondary">
              TV Ekranı
            </a>
          </div>
        </div>

        {actionError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
            {actionError}
          </div>
        )}

        {/* status */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Durum:{" "}
            <strong className="text-white">
              {phase === "idle" && "Boşta"}
              {phase === "performing" && "Performans"}
              {phase === "voting" && `Oylama Açık (${voteCount} oy)`}
              {phase === "showing-score" && `Puan: ${settings?.currentScore}/10`}
              {phase === "showing-winner" && `Gecenin Kazananı: ${settings?.currentApplicantName}`}
            </strong>
          </span>
          {settings?.currentApplicantName && (
            <span className="text-sm neon-text-magenta font-semibold">
              {settings.currentApplicantName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* controls */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6 space-y-3">
              <h2 className="font-display text-lg font-semibold text-white">Kontroller</h2>

              {phase === "idle" && nextUp && (
                <button
                  onClick={() => safeAction(() => actions.triggerStartSong(nextUp))}
                  className="btn-action btn-action--start w-full"
                >
                  Sahneye Al: {nextUp.name}
                </button>
              )}
              {phase === "idle" && !nextUp && (
                <p className="empty-state">Sırada kimse yok</p>
              )}
              {phase === "performing" && (
                <button
                  onClick={() => safeAction(() => actions.triggerStartVoting())}
                  className="btn-action btn-action--vote w-full"
                >
                  Puanla
                </button>
              )}
              {phase === "voting" && (
                <button
                  onClick={() => safeAction(() => actions.triggerEndVoting())}
                  className="btn-action btn-action--end-vote w-full"
                >
                  Puanlamayı Bitir
                </button>
              )}
              {phase === "showing-score" && (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400">{settings.currentApplicantName}</p>
                    <p className="font-display text-4xl font-extrabold neon-text-gold">
                      {settings.currentScore}
                    </p>
                    <p className="text-gray-400 text-sm">/ 10</p>
                  </div>
                  <button
                    onClick={() => safeAction(() => actions.triggerResetToIdle())}
                    className="btn-action btn-action--next w-full"
                  >
                    Sıradakine Geç
                  </button>
                </div>
              )}

              <hr className="border-dark-600 my-2" />

              {phase === "idle" && allQueue.some((a) => a.status === "performed") && (
                <button
                  onClick={() => safeAction(() => actions.showWinner())}
                  className="btn-action btn-action--winner w-full"
                >
                  Gecenin Kazananını Göster
                </button>
              )}

              {phase === "showing-winner" && (
                <button
                  onClick={() => safeAction(() => actions.triggerResetToIdle())}
                  className="btn-action btn-action--next w-full"
                >
                  Kapat
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm("Tüm sırayı temizlemek istediğinize emin misiniz?"))
                    safeAction(() => actions.clearAll());
                }}
                className="btn-danger w-full"
              >
                Tümünü Temizle
              </button>
            </div>
          </div>

          {/* queue */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-white mb-4">
                Sıra ({waitingQueue.length})
              </h2>

              {onStage && (
                <div className="on-stage-card mb-4">
                  <span className="on-stage-badge">SAHNEDE</span>
                  <p className="font-semibold text-white mt-2">
                    {onStage.name}{" "}
                    <span className="text-gray-500">{onStage.surname}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    {onStage.songTitle} – {onStage.songArtist}
                  </p>
                  {onStage.instagram && (
                    <p className="text-xs neon-text-magenta mt-1">@{onStage.instagram}</p>
                  )}
                </div>
              )}

              {waitingQueue.length === 0 ? (
                <p className="empty-state py-8">Sırada kimse yok</p>
              ) : (
                <div className="space-y-2">
                  {waitingQueue.map((a, i) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragEnter={() => handleDragEnter(i)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`queue-item group ${draggingIdx === i ? "queue-item--dragging" : ""}`}
                    >
                      <span className="drag-handle">
                        <GripIcon />
                      </span>
                      <span className="font-display font-bold text-gray-500 w-6">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {a.name}{" "}
                          <span className="text-gray-500">{a.surname}</span>
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {a.songTitle} – {a.songArtist}
                        </p>
                        {a.instagram && (
                          <p className="text-xs neon-text-magenta">@{a.instagram}</p>
                        )}
                      </div>
                      <button
                        onClick={() => safeAction(() => actions.updateApplicantStatus(a.id, "cancelled"))}
                        className="queue-item__cancel"
                      >
                        İptal
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* songs */}
        <SongManager />

        {/* qr */}
        <div className="glass rounded-2xl p-6 text-center">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Katılım QR Kodu
          </h2>
          <QRCode url={joinUrl} />
          <p className="text-xs text-gray-500 mt-3">
            Bu QR kodu TV ekranında veya mekanda gösterebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}
