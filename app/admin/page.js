"use client";
import { useState, useRef } from "react";
import { useSettings, useQueue, useAllQueue, useVoteCount, useClientUrl } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import QRCode from "@/components/QRCode";
import SongManager from "@/components/SongManager";
import AdminAuthGate from "@/components/AdminAuthGate";
import Logo from "@/components/Logo";

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

function AdminDashboard() {
  const [actionError, setActionError] = useState("");
  const settings = useSettings();
  const queue = useQueue();
  const allQueue = useAllQueue();
  const voteCount = useVoteCount();
  const { actions } = useStore();
  const joinUrl = useClientUrl("/join");

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIdx, setDraggingIdx] = useState(null);

  const safeAction = async (fn) => {
    setActionError("");
    try {
      await fn();
    } catch (err) {
      setActionError(err.message || "Bir hata oluştu.");
      setTimeout(() => setActionError(""), 4000);
    }
  };

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Logo variant="circle" size={64} priority />
            <div>
              <h1 className="heading-primary text-2xl">Admin Panel</h1>
              <p className="font-label text-cream-300 text-xs mt-1">
                Jukebox Live · Kontrol Merkezi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
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
              {settings?.isLive ? "● Canlı" : "Kapalı"}
            </button>
            <a href="/admin/istekler" className="btn-secondary">
              İstekler
            </a>
            <a href="/tv" target="_blank" className="btn-secondary">
              TV Ekranı
            </a>
          </div>
        </div>

        {actionError && (
          <div className="rounded-full py-2 px-4 text-center border border-jukebox-red/50 bg-jukebox-red/15 text-red-200 font-label tracking-widest text-sm">
            {actionError}
          </div>
        )}

        {/* status */}
        <div className="glass px-5 py-4 rounded-full flex items-center justify-between flex-wrap gap-3">
          <span className="font-label text-cream-300 text-sm">
            Durum{" "}
            <span className="text-cream ml-2">
              {phase === "idle" && "Boşta"}
              {phase === "performing" && "Performans"}
              {phase === "voting" && `Oylama Açık · ${voteCount} Oy`}
              {phase === "showing-score" && `Puan ${settings?.currentScore}/10`}
              {phase === "showing-winner" && `Kazanan · ${settings?.currentApplicantName}`}
            </span>
          </span>
          {settings?.currentApplicantName && (
            <span className="font-display text-cream text-lg uppercase">
              {settings.currentApplicantName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* controls */}
          <div className="space-y-4">
            <div className="glass p-6 space-y-3 rounded-2xl">
              <h2 className="section-title">Kontroller</h2>

              {phase === "idle" && nextUp && (
                <button
                  onClick={() => safeAction(() => actions.triggerStartSong(nextUp))}
                  className="btn-action btn-action--start w-full"
                >
                  Sahneye Al · {nextUp.name}
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
                    <p className="font-label text-cream-300 text-xs">
                      {settings.currentApplicantName}
                    </p>
                    <p className="font-display text-6xl neon-text-gold mt-1">
                      {settings.currentScore}
                    </p>
                    <p className="jukebox-artist text-cream-300">/ 10</p>
                  </div>
                  <button
                    onClick={() => safeAction(() => actions.triggerResetToIdle())}
                    className="btn-action btn-action--next w-full"
                  >
                    Sıradakine Geç
                  </button>
                </div>
              )}

              <div className="divider-ornament py-2">
                <span className="text-brass text-xs">★</span>
              </div>

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
                className="btn-danger"
              >
                Tümünü Temizle
              </button>
            </div>
          </div>

          {/* queue */}
          <div className="lg:col-span-2">
            <div className="glass p-6 rounded-2xl">
              <h2 className="section-title mb-4">
                Sıra <span className="text-brass-light ml-1">({waitingQueue.length})</span>
              </h2>

              {onStage && (
                <div className="on-stage-card mb-4">
                  <span className="on-stage-badge">Sahnede</span>
                  <p className="font-display text-xl uppercase text-cream mt-2">
                    {onStage.name}{" "}
                    <span className="text-cream-300">{onStage.surname}</span>
                  </p>
                  <p className="jukebox-artist text-cream-300">
                    {onStage.songTitle} — {onStage.songArtist}
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
                      <span className="font-display text-brass-light w-7 text-lg">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-sm font-semibold truncate">
                          {a.name}{" "}
                          <span className="text-cream-300/70">{a.surname}</span>
                        </p>
                        <p className="text-xs text-cream-300 truncate italic">
                          {a.songTitle} — {a.songArtist}
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
        <div className="glass p-6 rounded-2xl text-center">
          <h2 className="section-title mb-4">Katılım QR Kodu</h2>
          <QRCode url={joinUrl} />
          <p className="font-label text-cream-300 text-xs mt-4">
            Bu QR Kodu TV Ekranında Veya Mekânda Gösterebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminDashboard />
    </AdminAuthGate>
  );
}
