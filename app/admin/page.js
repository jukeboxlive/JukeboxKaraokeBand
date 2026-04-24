"use client";
import { useState } from "react";
import { useSettings, useQueue, useAllQueue, useVoteCount, useClientUrl } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import QRCode from "@/components/QRCode";
import SongManager from "@/components/SongManager";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminPasswordConfirm from "@/components/AdminPasswordConfirm";
import Logo from "@/components/Logo";
import SortableQueueItem from "@/components/SortableQueueItem";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

function AdminDashboard() {
  const [actionError, setActionError] = useState("");
  const settings = useSettings();
  const queue = useQueue();
  const allQueue = useAllQueue();
  const voteCount = useVoteCount();
  const { actions } = useStore();
  const joinUrl = useClientUrl("/join");

  // Şifre onayı gerektiren kritik aksiyonlar için modal state
  const [confirmModal, setConfirmModal] = useState(null);
  const openConfirm = (config) => setConfirmModal(config);
  const closeConfirm = () => setConfirmModal(null);

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

  // dnd-kit sensörleri — pointer (mouse/pen) + touch + klavye.
  // activationConstraint: ufak hareketler scroll ile karışmasın diye eşikli.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = waitingQueue.findIndex((a) => a.id === active.id);
    const newIndex = waitingQueue.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(waitingQueue, oldIndex, newIndex);
    const orderedIds = reordered.map((a) => a.id);
    safeAction(() => actions.reorderQueue(orderedIds));
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
              onClick={() => {
                const live = settings?.isLive;
                openConfirm({
                  title: live ? "Canlı Yayını Kapat" : "Canlı Yayını Aç",
                  message: live
                    ? "Aktif oturum sona erdirilecek, sıradaki tüm başvurular arşivlenecek. Devam etmek için admin şifrenizi girin."
                    : "Yeni bir canlı oturum başlatmak üzeresiniz. Devam etmek için admin şifrenizi girin.",
                  confirmLabel: live ? "Evet, Kapat" : "Evet, Başlat",
                  tone: live ? "danger" : "primary",
                  onConfirm: () =>
                    safeAction(async () => {
                      if (live) await actions.endStage();
                      else await actions.createStage();
                    }),
                });
              }}
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
                onClick={() =>
                  openConfirm({
                    title: "Tüm Sırayı Temizle",
                    message:
                      "Tüm sıra kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek için admin şifrenizi girin.",
                    confirmLabel: "Evet, Temizle",
                    tone: "danger",
                    onConfirm: () => safeAction(() => actions.clearAll()),
                  })
                }
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={waitingQueue.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {waitingQueue.map((a, i) => (
                        <SortableQueueItem
                          key={a.id}
                          applicant={a}
                          index={i}
                          onCancel={(id) =>
                            safeAction(() =>
                              actions.updateApplicantStatus(id, "cancelled"),
                            )
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
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

      <AdminPasswordConfirm
        visible={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        tone={confirmModal?.tone}
        onConfirm={confirmModal?.onConfirm}
        onClose={closeConfirm}
      />
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
